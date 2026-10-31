use serde::Deserialize;
use crate::models::{Album, Artist, ArtistBriefInfo, ArtistCover, ArtistDetails, SearchAllResult, Track, YandexResponse};
use super::client::YandexApiClient;

impl YandexApiClient {
    pub async fn search_tracks(&self, query: &str, search_type: Option<&str>) -> Result<Vec<Track>, String> {
        let search_type = search_type.unwrap_or("all");

        let response = self.client
            .get(format!("{}/search", super::client::API_BASE))
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Accept", "application/json")
            .query(&[
                ("text", query),
                ("type", search_type),
                ("page", "0")
            ])
            .send()
            .await
            .map_err(|e| format!("Search request failed: {}", e))?;

        #[derive(Debug, Deserialize)]
        #[serde(rename_all = "camelCase")]
        struct SearchResultData {
            tracks: Option<SearchItems<Track>>,
        }

        #[derive(Debug, Deserialize)]
        struct SearchItems<T> {
            results: Vec<T>,
        }

        let wrapper: YandexResponse<SearchResultData> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse search results: {}", e))?;

        Ok(wrapper.result.tracks.map(|t| t.results).unwrap_or_default())
    }

    pub async fn search_all(&self, query: &str) -> Result<SearchAllResult, String> {
        let response = self.client
            .get(format!("{}/search", super::client::API_BASE))
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Accept", "application/json")
            .query(&[
                ("text", query),
                ("type", "all"),
                ("page", "0")
            ])
            .send()
            .await
            .map_err(|e| format!("Search request failed: {}", e))?;

        let text = response.text().await
            .map_err(|e| format!("Failed to read response text: {}", e))?;

        let json: serde_json::Value = serde_json::from_str(&text)
            .map_err(|e| format!("Failed to parse search JSON: {}", e))?;

        let tracks_arr = json["result"]["tracks"]["results"]
            .as_array()
            .or_else(|| json["result"]["tracks"]["items"].as_array());

        let tracks: Vec<Track> = tracks_arr
            .map(|items| {
                items.iter().filter_map(|item| {
                    let id = match &item["id"] {
                        serde_json::Value::Number(n) => n.to_string(),
                        serde_json::Value::String(s) => s.clone(),
                        _ => return None,
                    };

                    let title = item["title"].as_str().unwrap_or("Без названия").to_string();
                    let duration_ms = item["durationMs"].as_u64().unwrap_or(0);

                    let cover_uri = item["coverUri"].as_str()
                        .or_else(|| {
                            item["albums"].as_array()
                                .and_then(|albums| albums.first())
                                .and_then(|album| album["coverUri"].as_str())
                        })
                        .map(|s| s.to_string());

                    let artists = item["artists"].as_array()
                        .map(|artists| {
                            let artist_list: Vec<Artist> = artists.iter().filter_map(|a| {
                                let artist_id = match &a["id"] {
                                    serde_json::Value::Number(n) => n.as_u64().unwrap_or(0),
                                    serde_json::Value::String(s) => s.parse::<u64>().unwrap_or(0),
                                    _ => 0,
                                };

                                let artist_name = a["name"].as_str().unwrap_or("Неизвестный исполнитель").to_string();
                                let cover = a["cover"]["uri"].as_str().map(|uri| ArtistCover {
                                    uri: Some(uri.to_string())
                                });

                                Some(Artist {
                                    id: artist_id,
                                    name: artist_name,
                                    cover,
                                })
                            }).collect();

                            if artist_list.is_empty() {
                                vec![Artist {
                                    id: 0,
                                    name: "Неизвестный исполнитель".to_string(),
                                    cover: None,
                                }]
                            } else {
                                artist_list
                            }
                        })
                        .unwrap_or_else(|| vec![Artist {
                            id: 0,
                            name: "Неизвестный исполнитель".to_string(),
                            cover: None,
                        }]);

                    Some(Track {
                        id,
                        title,
                        artists,
                        cover_uri,
                        duration_ms,
                    })
                }).collect()
            })
            .unwrap_or_default();

        let artists_arr = json["result"]["artists"]["results"]
            .as_array()
            .or_else(|| json["result"]["artists"]["items"].as_array());

        let artists: Vec<Artist> = artists_arr
            .map(|items| {
                items.iter().filter_map(|item| {
                    let id = match &item["id"] {
                        serde_json::Value::Number(n) => n.as_u64().unwrap_or(0),
                        serde_json::Value::String(s) => s.parse::<u64>().unwrap_or(0),
                        _ => return None,
                    };

                    let name = item["name"].as_str().unwrap_or("").to_string();
                    if name.is_empty() {
                        return None;
                    }

                    let cover = item["cover"]["uri"].as_str().map(|uri| ArtistCover {
                        uri: Some(uri.to_string())
                    });

                    Some(Artist { id, name, cover })
                }).collect()
            })
            .unwrap_or_default();

        Ok(SearchAllResult { tracks, artists })
    }

    pub async fn get_artist_brief_info(&self, artist_id: &str) -> Result<ArtistBriefInfo, String> {
        let response = self.get(&format!("/artists/{}/brief-info", artist_id)).await?;

        let json: serde_json::Value = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse artist brief info: {}", e))?;

        let result = &json["result"];

        let artist_data = &result["artist"];
        let artist = ArtistDetails {
            id: artist_data["id"].as_u64().unwrap_or(0),
            name: artist_data["name"].as_str().unwrap_or("").to_string(),
            cover: artist_data["cover"]["uri"].as_str().map(|uri| ArtistCover {
                uri: Some(uri.to_string())
            }),
            genres: artist_data["genres"].as_array()
                .map(|arr| arr.iter()
                    .filter_map(|g| g.as_str().map(|s| s.to_string()))
                    .collect())
                .unwrap_or_default(),
        };

        let popular_tracks = result["popularTracks"].as_array()
            .map(|tracks| {
                tracks.iter().filter_map(|item| {
                    let id = match &item["id"] {
                        serde_json::Value::Number(n) => n.to_string(),
                        serde_json::Value::String(s) => s.clone(),
                        _ => return None,
                    };

                    Some(Track {
                        id,
                        title: item["title"].as_str().unwrap_or("").to_string(),
                        artists: item["artists"].as_array()
                            .map(|artists| {
                                artists.iter().filter_map(|a| {
                                    Some(Artist {
                                        id: a["id"].as_u64().unwrap_or(0),
                                        name: a["name"].as_str().unwrap_or("").to_string(),
                                        cover: a["cover"]["uri"].as_str().map(|uri| ArtistCover {
                                            uri: Some(uri.to_string())
                                        }),
                                    })
                                }).collect()
                            })
                            .unwrap_or_default(),
                        cover_uri: item["coverUri"].as_str().map(|s| s.to_string()),
                        duration_ms: item["durationMs"].as_u64().unwrap_or(0),
                    })
                }).collect()
            })
            .unwrap_or_default();

        let albums = result["albums"].as_array()
            .map(|albums| {
                albums.iter().filter_map(|item| {
                    Some(Album {
                        id: item["id"].as_u64().unwrap_or(0),
                        title: item["title"].as_str().unwrap_or("").to_string(),
                        year: item["year"].as_u64().map(|y| y as u32),
                        cover_uri: item["coverUri"].as_str().map(|s| s.to_string()),
                    })
                }).collect()
            })
            .unwrap_or_default();

        Ok(ArtistBriefInfo {
            artist,
            popular_tracks,
            albums,
        })
    }

    pub async fn get_artist_tracks(&self, artist_id: &str, page: u32, page_size: u32) -> Result<Vec<Track>, String> {
        let url = format!("{}/artists/{}/tracks", super::client::API_BASE, artist_id);
        let resp = self.client.get(&url)
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Accept", "application/json")
            .query(&[("page", &page.to_string()), ("page-size", &page_size.to_string())])
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))?;

        let json: serde_json::Value = resp.json().await.map_err(|e| format!("JSON parse failed: {}", e))?;
        let tracks_arr = json["result"]["tracks"].as_array().ok_or("No tracks found")?;

        let tracks: Vec<Track> = tracks_arr.iter().filter_map(|item| {
            let id = match &item["id"] {
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::String(s) => s.clone(),
                _ => return None,
            };
            let title = item["title"].as_str().unwrap_or("").to_string();
            let duration_ms = item["durationMs"].as_u64().unwrap_or(0);
            let cover_uri = item["coverUri"].as_str().map(|s| s.to_string());
            let artists: Vec<Artist> = item["artists"].as_array()
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

            Some(Track {
                id,
                title,
                artists,
                cover_uri,
                duration_ms,
            })
        }).collect();

        Ok(tracks)
    }
}
