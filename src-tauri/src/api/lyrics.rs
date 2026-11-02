use serde::Deserialize;
use base64::Engine;
use base64::prelude::BASE64_STANDARD;
use crate::models::{LyricsResult, ProviderLyrics};
use super::client::YandexApiClient;

fn clean_term(s: &str) -> String {
    let without_parentheses = s.split('(').next().unwrap_or(s);
    let without_brackets = without_parentheses.split('[').next().unwrap_or(without_parentheses);
    without_brackets
    .replace(['ё', 'Ё'], "е")
    .replace("feat.", "")
    .replace("ft.", "")
    .replace("prod.", "")
    .replace(['!', '?', '~'], "")
    .trim()
    .to_string()
}

fn sanitize_lrc(raw: &str) -> Option<String> {
    let mut valid_lines = Vec::new();
    let mut timestamp_count = 0;

    for line in raw.lines() {
        let t = line.trim();
        if t.is_empty() {
            continue;
        }

        if t.starts_with("[ti:") || t.starts_with("[ar:") || t.starts_with("[al:")
            || t.starts_with("[by:") || t.starts_with("[offset:") || t.starts_with("[re:")
            || t.starts_with("[ve:") || t.starts_with("[length:")
            {
                continue;
            }

            if t.starts_with('[') && t.contains(']') {
                timestamp_count += 1;
                valid_lines.push(t.to_string());
            }
    }

    if timestamp_count >= 2 {
        Some(valid_lines.join("\n"))
    } else {
        None
    }
}

fn extract_plain_from_lrc(lrc: &str) -> String {
    let mut result = Vec::new();
    for line in lrc.lines() {
        if let Some(pos) = line.rfind(']') {
            let text = line[pos + 1..].trim();
            if !text.is_empty() {
                result.push(text);
            }
        }
    }
    result.join("\n")
}

impl YandexApiClient {
    async fn fetch_lrclib(&self, artist: &str, title: &str, duration_secs: f64) -> (Option<String>, Option<String>) {
        let clean_artist = clean_term(artist);
        let clean_title = clean_term(title);

        let queries = vec![
            format!("{} {}", clean_artist, clean_title),
                format!("{} {}", artist, title),
                    clean_title.clone(),
        ];

        #[derive(Deserialize)]
        struct LrcItem {
            duration: Option<f64>,
            #[serde(rename = "plainLyrics")] plain_lyrics: Option<String>,
            #[serde(rename = "syncedLyrics")] synced_lyrics: Option<String>,
        }

        for q in queries {
            let resp = self.client.get("https://lrclib.net/api/search")
            .header("User-Agent", "wyandexmusic/0.2.0 (desktop)")
            .query(&[("q", &q)])
            .timeout(std::time::Duration::from_secs(3))
            .send()
            .await;

            let Ok(r) = resp else { continue };
            if !r.status().is_success() { continue };

            let Ok(items) = r.json::<Vec<LrcItem>>().await else { continue };

            let mut candidates: Vec<(f64, String, Option<String>)> = Vec::new();
            for item in items {
                let Some(s) = item.synced_lyrics else { continue };
                let Some(clean_s) = sanitize_lrc(&s) else { continue };
                let diff = (item.duration.unwrap_or(duration_secs) - duration_secs).abs();

                if diff <= 8.0 {
                    candidates.push((diff, clean_s, item.plain_lyrics));
                }
            }

            candidates.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

            if let Some(best) = candidates.into_iter().next() {
                return (best.2, Some(best.1));
            }
        }

        (None, None)
    }

    async fn fetch_netease(&self, artist: &str, title: &str, duration_ms: u64) -> (Option<String>, Option<String>) {
        let clean_title = clean_term(title);
        let clean_artist = clean_term(artist);

        let queries = vec![
            format!("{} {}", clean_artist, clean_title),
                format!("{} {}", artist, title),
        ];

        #[derive(Deserialize)]
        struct SearchResp { result: Option<SearchResult> }
        #[derive(Deserialize)]
        struct SearchResult { songs: Option<Vec<SongItem>> }
        #[derive(Deserialize)]
        struct SongItem { id: u64, dt: Option<u64> }

        for q in queries {
            let s_resp = self.client.get("https://music.163.com/api/search/pc")
            .query(&[("s", &q), ("type", &"1".to_string()), ("limit", &"5".to_string())])
            .timeout(std::time::Duration::from_secs(3))
            .send()
            .await;

            let Ok(resp) = s_resp else { continue };
            let Ok(data) = resp.json::<SearchResp>().await else { continue };
            let Some(songs) = data.result.and_then(|r| r.songs) else { continue };

            let matched_song = songs.into_iter().find(|s| {
                s.dt.map(|dt| (dt as i64 - duration_ms as i64).abs() <= 5000).unwrap_or(false)
            });

            let Some(song) = matched_song else { continue };

            let l_resp = self.client.get("https://music.163.com/api/song/lyric")
            .query(&[("id", &song.id.to_string()), ("lv", &"1".to_string())])
            .timeout(std::time::Duration::from_secs(3))
            .send()
            .await;

            let Ok(l_data_resp) = l_resp else { continue };
            #[derive(Deserialize)]
            struct LyricResp { lrc: Option<LrcNode> }
            #[derive(Deserialize)]
            struct LrcNode { lyric: Option<String> }

            if let Ok(l_data) = l_data_resp.json::<LyricResp>().await {
                if let Some(raw) = l_data.lrc.and_then(|l| l.lyric) {
                    if let Some(clean_lrc) = sanitize_lrc(&raw) {
                        let plain = extract_plain_from_lrc(&clean_lrc);
                        return (Some(plain), Some(clean_lrc));
                    }
                }
            }
        }

        (None, None)
    }

    async fn fetch_kugou(&self, artist: &str, title: &str, duration_ms: u64) -> (Option<String>, Option<String>) {
        let clean_title = clean_term(title);
        let clean_artist = clean_term(artist);
        let keyword = format!("{} {}", clean_artist, clean_title);

        #[derive(Deserialize)]
        struct KgSearchResp { status: u32, candidates: Option<Vec<KgCandidate>> }
        #[derive(Deserialize)]
        struct KgCandidate { id: String, accesskey: String }

        let s_url = "http://lyrics.kugou.com/search";
        let resp = self.client.get(s_url)
        .query(&[
            ("ver", "1"),
               ("man", "yes"),
               ("client", "pc"),
               ("keyword", &keyword),
               ("duration", &duration_ms.to_string()),
               ("hash", ""),
        ])
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await;

        let Ok(r) = resp else { return (None, None); };
        let Ok(data) = r.json::<KgSearchResp>().await else { return (None, None); };
        if data.status != 200 { return (None, None); }
        let Some(candidates) = data.candidates else { return (None, None); };
        let Some(first) = candidates.into_iter().next() else { return (None, None); };

        #[derive(Deserialize)]
        struct KgDownResp { status: u32, content: Option<String> }

        let d_url = "http://lyrics.kugou.com/download";
        let d_resp = self.client.get(d_url)
        .query(&[
            ("ver", "1"),
               ("client", "pc"),
               ("id", &first.id),
               ("accesskey", &first.accesskey),
               ("fmt", "lrc"),
               ("charset", "utf8"),
        ])
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await;

        let Ok(dr) = d_resp else { return (None, None); };
        let Ok(ddata) = dr.json::<KgDownResp>().await else { return (None, None); };
        if ddata.status != 200 { return (None, None); }
        let Some(b64) = ddata.content else { return (None, None); };

        if let Ok(bytes) = BASE64_STANDARD.decode(b64.trim()) {
            if let Ok(raw_lrc) = String::from_utf8(bytes) {
                if let Some(clean_lrc) = sanitize_lrc(&raw_lrc) {
                    let plain = extract_plain_from_lrc(&clean_lrc);
                    return (Some(plain), Some(clean_lrc));
                }
            }
        }

        (None, None)
    }

    async fn fetch_karalyr(&self, artist: &str, title: &str, duration_secs: f64) -> (Option<String>, Option<String>) {
        let clean_title = clean_term(title);
        let clean_artist = clean_term(artist);
        let dur_int = duration_secs.round() as u64;

        #[derive(Deserialize)]
        struct KlResponse {
            #[serde(rename = "plainLyrics")] plain_lyrics: Option<String>,
            #[serde(rename = "syncedLyrics")] synced_lyrics: Option<String>,
        }

        let resp = self.client.get("https://karalyr.com/api/get")
        .query(&[
            ("track_name", clean_title.as_str()),
               ("artist_name", clean_artist.as_str()),
               ("duration", &dur_int.to_string()),
        ])
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await;

        if let Ok(r) = resp {
            if r.status().is_success() {
                if let Ok(data) = r.json::<KlResponse>().await {
                    let synced = data.synced_lyrics.as_deref().and_then(sanitize_lrc);
                    if synced.is_some() || data.plain_lyrics.is_some() {
                        return (data.plain_lyrics, synced);
                    }
                }
            }
        }

        (None, None)
    }

    async fn fetch_lyricsovh(&self, artist: &str, title: &str) -> Option<String> {
        let clean_title = clean_term(title);
        let clean_artist = clean_term(artist);
        let url = format!("https://api.lyrics.ovh/v1/{}/{}", clean_artist, clean_title);

        #[derive(Deserialize)]
        struct OvhResp { lyrics: Option<String> }

        let resp = self.client.get(&url)
        .timeout(std::time::Duration::from_secs(3))
        .send()
        .await
        .ok()?;

        if !resp.status().is_success() {
            return None;
        }

        let data: OvhResp = resp.json().await.ok()?;
        let txt = data.lyrics?.trim().to_string();
        if txt.len() > 30 {
            Some(txt)
        } else {
            None
        }
    }

    pub async fn get_lyrics(&self, _track_id: &str, artist: &str, title: &str, duration_ms: u64) -> Result<LyricsResult, String> {
        let duration_secs = (duration_ms as f64) / 1000.0;

        let (
            (lrc_plain, lrc_synced),
             (ne_plain, ne_synced),
             (kg_plain, kg_synced),
             (kl_plain, kl_synced),
             ovh_plain,
        ) = tokio::join!(
            self.fetch_lrclib(artist, title, duration_secs),
                         self.fetch_netease(artist, title, duration_ms),
                         self.fetch_kugou(artist, title, duration_ms),
                         self.fetch_karalyr(artist, title, duration_secs),
                         self.fetch_lyricsovh(artist, title),
        );

        let mut providers = Vec::new();

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
                           name: "NetEase Cloud".to_string(),
                           plain_lyrics: ne_plain.clone(),
                           synced_lyrics: ne_synced.clone(),
            });
        }

        if kg_synced.is_some() || kg_plain.is_some() {
            providers.push(ProviderLyrics {
                source: "kugou".to_string(),
                           name: "KuGou Music".to_string(),
                           plain_lyrics: kg_plain.clone(),
                           synced_lyrics: kg_synced.clone(),
            });
        }

        if kl_synced.is_some() || kl_plain.is_some() {
            providers.push(ProviderLyrics {
                source: "karalyr".to_string(),
                           name: "Karalyr".to_string(),
                           plain_lyrics: kl_plain.clone(),
                           synced_lyrics: kl_synced.clone(),
            });
        }

        if let Some(ref ovh_txt) = ovh_plain {
            providers.push(ProviderLyrics {
                source: "lyricsovh".to_string(),
                           name: "Lyrics.ovh".to_string(),
                           plain_lyrics: Some(ovh_txt.clone()),
                           synced_lyrics: None,
            });
        }

        providers.sort_by_key(|p| if p.synced_lyrics.is_some() { 0 } else { 1 });

        let synced_lyrics = lrc_synced
        .or(ne_synced)
        .or(kg_synced)
        .or(kl_synced);

        let mut plain_lyrics = lrc_plain
        .or(ne_plain)
        .or(kg_plain)
        .or(kl_plain)
        .or(ovh_plain);

        if plain_lyrics.is_none() && synced_lyrics.is_some() {
            let extracted = extract_plain_from_lrc(synced_lyrics.as_ref().unwrap());
            if !extracted.is_empty() {
                plain_lyrics = Some(extracted);
            }
        }

        Ok(LyricsResult {
            plain_lyrics,
            synced_lyrics,
            providers,
        })
    }
}
