use serde::Deserialize;
use crate::models::{LyricsResult, ProviderLyrics};
use super::client::{YandexApiClient, API_BASE};

fn is_valid_lrc(lrc: &str) -> bool {
    let mut count = 0;
    for line in lrc.lines() {
        let t = line.trim();
        if t.contains('[') && t.contains(']') && t.len() > 6 && !t.starts_with("[offset:") && !t.starts_with("[ar:") && !t.starts_with("[ti:") {
            count += 1;
        }
    }
    count >= 3
}

impl YandexApiClient {
    async fn fetch_yandex_supplement_raw(&self, token: &str, track_id: &str) -> Option<String> {
        let clean_id = track_id.split(':').next().unwrap_or(track_id).trim();
        let url = format!("{}/tracks/{}/supplement", API_BASE, clean_id);

        let resp = self.client.get(&url)
            .header("Authorization", format!("OAuth {}", token))
            .header("X-Yandex-Music-Client", "YandexMusic/2024.01.1 (Android; 14)")
            .header("Accept", "application/json")
            .timeout(std::time::Duration::from_secs(5))
            .send()
            .await
            .ok()?;

        let json: serde_json::Value = resp.json().await.ok()?;
        let res = &json["result"];

        if let Some(text) = res["lyrics"]["fullLyrics"].as_str() {
            if text.trim().len() > 30 {
                return Some(text.to_string());
            }
        }

        if let Some(text) = res["lyrics"]["text"].as_str() {
            if text.trim().len() > 30 {
                return Some(text.to_string());
            }
        }

        None
    }

    async fn fetch_yandex_canonical_plain(&self, token: &str, track_id: &str, artist: &str, title: &str) -> Option<String> {
        if let Some(text) = self.fetch_yandex_supplement_raw(token, track_id).await {
            return Some(text);
        }

        let clean_title = title.split('(').next().unwrap_or(title).trim().replace('ё', "е").replace('Ё', "Е");
        let clean_artist = artist.split(',').next().unwrap_or(artist).trim().replace('ё', "е").replace('Ё', "Е");
        let query = format!("{} {}", clean_artist, clean_title);

        let search_url = format!("{}/search", API_BASE);
        let resp = self.client.get(&search_url)
            .header("Authorization", format!("OAuth {}", token))
            .header("X-Yandex-Music-Client", "YandexMusic/2024.01.1 (Android; 14)")
            .header("Accept", "application/json")
            .query(&[("text", query.as_str()), ("type", "track"), ("page", "0")])
            .timeout(std::time::Duration::from_secs(5))
            .send()
            .await
            .ok()?;

        let json: serde_json::Value = resp.json().await.ok()?;
        let tracks = json["result"]["tracks"]["results"].as_array()?;

        for item in tracks.iter().take(6) {
            let other_id = match &item["id"] {
                serde_json::Value::Number(n) => n.to_string(),
                serde_json::Value::String(s) => s.clone(),
                _ => continue,
            };

            if let Some(text) = self.fetch_yandex_supplement_raw(token, &other_id).await {
                return Some(text);
            }
        }

        None
    }

    async fn fetch_lrclib_smart(&self, artist: &str, title: &str, duration_secs: f64) -> (Option<String>, Option<String>) {
        let clean_title = title.split('(').next().unwrap_or(title).trim().replace('ё', "е").replace('Ё', "Е");
        let clean_artist = artist.split(',').next().unwrap_or(artist).trim().replace('ё', "е").replace('Ё', "Е");

        let search_resp = self.client.get("https://lrclib.net/api/search")
            .header("User-Agent", "wyandexmusic/0.1.0 (https://github.com/wyandexmusic)")
            .query(&[("q", &format!("{} {}", clean_artist, clean_title))])
            .timeout(std::time::Duration::from_secs(4))
            .send()
            .await;

        let Ok(resp) = search_resp else { return (None, None); };
        if !resp.status().is_success() { return (None, None); }

        #[derive(Deserialize)]
        struct Item {
            duration: Option<f64>,
            #[serde(rename = "trackName")] track_name: Option<String>,
            #[serde(rename = "plainLyrics")] plain_lyrics: Option<String>,
            #[serde(rename = "syncedLyrics")] synced_lyrics: Option<String>,
        }

        let Ok(items) = resp.json::<Vec<Item>>().await else { return (None, None); };

        let mut candidates: Vec<(f64, usize, String, Option<String>)> = Vec::new();

        for item in items {
            let Some(s) = item.synced_lyrics else { continue };
            if !is_valid_lrc(&s) { continue; }
            let Some(d) = item.duration else { continue };

            let diff = (d - duration_secs).abs();
            if diff > 5.0 { continue; }

            let t_name = item.track_name.unwrap_or_default().to_lowercase();
            if (t_name.contains("reverb") || t_name.contains("muffled") || t_name.contains("slowed")) && !title.to_lowercase().contains("reverb") {
                continue;
            }

            let lines_count = s.lines().count();
            candidates.push((diff, lines_count, s, item.plain_lyrics));
        }

        candidates.sort_by(|a, b| {
            let diff_a = a.0.round() as i64;
            let diff_b = b.0.round() as i64;
            if diff_a != diff_b {
                diff_a.cmp(&diff_b)
            } else {
                b.1.cmp(&a.1)
            }
        });

        if let Some(best) = candidates.into_iter().next() {
            return (best.3, Some(best.2));
        }

        (None, None)
    }

    async fn fetch_netease(&self, artist: &str, title: &str, duration_ms: u64) -> (Option<String>, Option<String>) {
        let clean_title = title.split('(').next().unwrap_or(title).trim().replace('ё', "е").replace('Ё', "Е");
        let clean_artist = artist.split(',').next().unwrap_or(artist).trim().replace('ё', "е").replace('Ё', "Е");

        let query = format!("{} {}", clean_artist, clean_title);
        let s_resp = self.client.get("http://music.163.com/api/search/pc")
            .query(&[("s", &query), ("type", &"1".to_string()), ("limit", &"5".to_string())])
            .timeout(std::time::Duration::from_secs(4))
            .send()
            .await;

        let song_id = match s_resp {
            Ok(resp) => {
                #[derive(Deserialize)]
                struct SearchResp { result: Option<SearchResult> }
                #[derive(Deserialize)]
                struct SearchResult { songs: Option<Vec<SongItem>> }
                #[derive(Deserialize)]
                struct SongItem { id: u64, dt: Option<u64> }

                if let Ok(s_data) = resp.json::<SearchResp>().await {
                    s_data.result
                        .and_then(|r| r.songs)
                        .and_then(|songs| {
                            songs.into_iter().find(|s| {
                                s.dt.map(|dt| (dt as i64 - duration_ms as i64).abs() <= 3000).unwrap_or(false)
                            }).map(|s| s.id)
                        })
                } else {
                    None
                }
            }
            _ => None,
        };

        let Some(id) = song_id else { return (None, None); };

        let l_resp = self.client.get("http://music.163.com/api/song/lyric")
            .query(&[("id", &id.to_string()), ("lv", &"1".to_string())])
            .timeout(std::time::Duration::from_secs(4))
            .send()
            .await;

        if let Ok(resp) = l_resp {
            #[derive(Deserialize)]
            struct LyricResp { lrc: Option<LrcItem> }
            #[derive(Deserialize)]
            struct LrcItem { lyric: Option<String> }

            if let Ok(l_data) = resp.json::<LyricResp>().await {
                if let Some(text) = l_data.lrc.and_then(|l| l.lyric) {
                    if is_valid_lrc(&text) {
                        let plain = text.lines()
                            .map(|line| {
                                if let Some(pos) = line.rfind(']') { line[pos + 1..].trim() } else { line.trim() }
                            })
                            .filter(|l| !l.is_empty())
                            .collect::<Vec<&str>>()
                            .join("\n");
                        return (Some(plain), Some(text));
                    }
                }
            }
        }

        (None, None)
    }

    pub async fn get_lyrics(&self, track_id: &str, artist: &str, title: &str, duration_ms: u64) -> Result<LyricsResult, String> {
        let duration_secs = (duration_ms as f64) / 1000.0;

        let (yandex_text, (lrc_plain, lrc_synced), (ne_plain, ne_synced)) = tokio::join!(
            self.fetch_yandex_canonical_plain(&self.token, track_id, artist, title),
            self.fetch_lrclib_smart(artist, title, duration_secs),
            self.fetch_netease(artist, title, duration_ms),
        );

        let mut providers = Vec::new();

        if let Some(ref yt) = yandex_text {
            providers.push(ProviderLyrics {
                source: "yandex".to_string(),
                name: "Яндекс Музыка".to_string(),
                plain_lyrics: Some(yt.clone()),
                synced_lyrics: None,
            });
        }

        if lrc_synced.is_some() || lrc_plain.is_some() {
            providers.push(ProviderLyrics {
                source: "lrclib".to_string(),
                name: "LRCLIB".to_string(),
                plain_lyrics: lrc_plain.clone(),
                synced_lyrics: lrc_synced.clone(),
            });
        }

        if ne_synced.is_some() || ne_plain.is_some() {
            providers.push(ProviderLyrics {
                source: "netease".to_string(),
                name: "NetEase".to_string(),
                plain_lyrics: ne_plain.clone(),
                synced_lyrics: ne_synced.clone(),
            });
        }

        let synced_lyrics = lrc_synced.or(ne_synced);
        let mut plain_lyrics = yandex_text.or(lrc_plain).or(ne_plain);

        if plain_lyrics.is_none() && synced_lyrics.is_some() {
            let re_cleaned = synced_lyrics.as_ref().unwrap()
                .lines()
                .map(|line| {
                    if let Some(pos) = line.rfind(']') { line[pos + 1..].trim() } else { line.trim() }
                })
                .filter(|l| !l.is_empty())
                .collect::<Vec<&str>>()
                .join("\n");
            if re_cleaned.len() > 30 {
                plain_lyrics = Some(re_cleaned);
            }
        }

        Ok(LyricsResult {
            plain_lyrics,
            synced_lyrics,
            providers,
        })
    }
}
