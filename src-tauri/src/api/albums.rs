use crate::models::{Artist, Track};
use super::client::{YandexApiClient, API_BASE};

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct AlbumWithTracks {
    pub id: u64,
    pub title: String,
    pub year: Option<u32>,
    pub cover_uri: Option<String>,
    pub artists: Vec<Artist>,
    pub tracks: Vec<Track>,
}

#[derive(Debug, serde::Serialize, serde::Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct SearchAlbumItem {
    pub id: u64,
    pub title: String,
    pub year: Option<u32>,
    pub cover_uri: Option<String>,
    pub artists: Vec<Artist>,
    pub track_count: Option<u32>,
}

impl YandexApiClient {
    pub async fn get_album_with_tracks(&self, album_id: u64) -> Result<AlbumWithTracks, String> {
        let url = format!("{}/albums/{}/with-tracks", API_BASE, album_id);
        let resp = self.client.get(&url)
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Accept", "application/json")
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let json: serde_json::Value = resp.json().await
            .map_err(|e| format!("JSON parse failed: {}", e))?;

        let res = &json["result"];
        let id = res["id"].as_u64().unwrap_or(album_id);
        let title = res["title"].as_str().unwrap_or("Альбом").to_string();
        let year = res["year"].as_u64().map(|y| y as u32);
        let cover_uri = res["coverUri"].as_str().map(|s| s.to_string());

        let artists: Vec<Artist> = res["artists"].as_array()
            .map(|arr| {
                arr.iter().filter_map(|a| {
                    Some(Artist {
                        id: a["id"].as_u64().unwrap_or(0),
                        name: a["name"].as_str().unwrap_or("").to_string(),
                        cover: None,
                    })
                }).collect()
            })
            .unwrap_or_default();

        let mut tracks: Vec<Track> = Vec::new();
        if let Some(vols) = res["volumes"].as_array() {
            for vol in vols {
                if let Some(tr_arr) = vol.as_array() {
                    for item in tr_arr {
                        let tr_id = match &item["id"] {
                            serde_json::Value::Number(n) => n.to_string(),
                            serde_json::Value::String(s) => s.clone(),
                            _ => continue,
                        };
                        let tr_title = item["title"].as_str().unwrap_or("").to_string();
                        let tr_cover = item["coverUri"].as_str().map(|s| s.to_string()).or_else(|| cover_uri.clone());
                        let tr_duration = item["durationMs"].as_u64().unwrap_or(0);
                        let tr_artists: Vec<Artist> = item["artists"].as_array()
                            .map(|arr| {
                                arr.iter().filter_map(|a| {
                                    Some(Artist {
                                        id: a["id"].as_u64().unwrap_or(0),
                                        name: a["name"].as_str().unwrap_or("").to_string(),
                                        cover: None,
                                    })
                                }).collect()
                            })
                            .unwrap_or_else(|| artists.clone());

                        tracks.push(Track {
                            id: tr_id,
                            title: tr_title,
                            artists: tr_artists,
                            cover_uri: tr_cover,
                            duration_ms: tr_duration,
                        });
                    }
                }
            }
        }

        Ok(AlbumWithTracks {
            id,
            title,
            year,
            cover_uri,
            artists,
            tracks,
        })
    }

    pub async fn search_albums(&self, query: &str) -> Result<Vec<SearchAlbumItem>, String> {
        let url = format!("{}/search", API_BASE);
        let resp = self.client.get(&url)
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Accept", "application/json")
            .query(&[("text", query), ("type", "album"), ("page", "0")])
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let json: serde_json::Value = resp.json().await
            .map_err(|e| format!("JSON parse failed: {}", e))?;

        let albums_arr = json["result"]["albums"]["results"].as_array()
            .or_else(|| json["result"]["albums"]["items"].as_array());

        let albums = albums_arr.map(|items| {
            items.iter().filter_map(|item| {
                let id = item["id"].as_u64()?;
                let title = item["title"].as_str().unwrap_or("").to_string();
                let year = item["year"].as_u64().map(|y| y as u32);
                let cover_uri = item["coverUri"].as_str().map(|s| s.to_string());
                let track_count = item["trackCount"].as_u64().map(|c| c as u32);
                let artists = item["artists"].as_array()
                    .map(|arr| {
                        arr.iter().filter_map(|a| {
                            Some(Artist {
                                id: a["id"].as_u64().unwrap_or(0),
                                name: a["name"].as_str().unwrap_or("").to_string(),
                                cover: None,
                            })
                        }).collect()
                    })
                    .unwrap_or_default();

                Some(SearchAlbumItem {
                    id,
                    title,
                    year,
                    cover_uri,
                    artists,
                    track_count,
                })
            }).collect()
        }).unwrap_or_default();

        Ok(albums)
    }
}
