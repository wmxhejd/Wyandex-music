use serde::{Deserialize, Serialize, Deserializer};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SearchAllResult {
    pub tracks: Vec<Track>,
    pub artists: Vec<Artist>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct YandexConfig {
    pub access_token: Option<String>,
    pub user_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct YandexResponse<T> {
    pub result: T,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AccountStatusResult {
    pub account: Account,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Account {
    pub uid: u64,
    pub login: String,
    #[serde(rename = "displayName")]
    pub display_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadInfo {
    pub codec: String,
    pub bitrate_in_kbps: u32,
    pub download_info_url: String,
    pub direct: Option<bool>,
}

fn deserialize_track_id<'de, D>(deserializer: D) -> Result<String, D::Error>
where
    D: Deserializer<'de>,
{
    let value: serde_json::Value = Deserialize::deserialize(deserializer)?;
    match value {
        serde_json::Value::Number(n) => Ok(n.to_string()),
        serde_json::Value::String(s) => Ok(s),
        _ => Err(serde::de::Error::custom("Track ID must be number or string")),
    }
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Track {
    #[serde(deserialize_with = "deserialize_track_id")]
    pub id: String,
    pub title: String,
    pub artists: Vec<Artist>,
    #[serde(rename = "coverUri")]
    pub cover_uri: Option<String>,
    #[serde(rename = "durationMs")]
    pub duration_ms: u64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Artist {
    pub id: u64,
    pub name: String,
    pub cover: Option<ArtistCover>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ArtistCover {
    pub uri: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArtistBriefInfo {
    pub artist: ArtistDetails,
    pub popular_tracks: Vec<Track>,
    pub albums: Vec<Album>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ArtistDetails {
    pub id: u64,
    pub name: String,
    pub cover: Option<ArtistCover>,
    pub genres: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Album {
    pub id: u64,
    pub title: String,
    pub year: Option<u32>,
    #[serde(rename = "coverUri")]
    pub cover_uri: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RotorStationTracks {
    pub sequence: Vec<RotorSequenceItem>,
    #[serde(rename = "batchId")]
    pub batch_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RotorSequenceItem {
    #[serde(rename = "type")]
    pub item_type: Option<String>,
    pub track: Track,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RotorSessionResponse {
    pub radio_session_id: String,
    pub batch_id: String,
    pub sequence: Vec<RotorSequenceItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RotorSessionNewRequest {
    pub seeds: Vec<String>,
    #[serde(rename = "includeTracksInResponse")]
    pub include_tracks_in_response: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LikedTracksResult {
    pub library: Library,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Library {
    pub tracks: Vec<LikedTrackItem>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LikedTrackItem {
    pub id: String,
    #[serde(rename = "albumId")]
    pub album_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Playlist {
    pub kind: u64,
    pub title: String,
    pub track_count: u32,
    pub cover: Option<PlaylistCover>,
    pub og_image: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PlaylistCover {
    pub uri: Option<String>,
    pub items_uri: Option<Vec<String>>,
    pub dir: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProviderLyrics {
    pub source: String,
    pub name: String,
    pub plain_lyrics: Option<String>,
    pub synced_lyrics: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct LyricsResult {
    pub plain_lyrics: Option<String>,
    pub synced_lyrics: Option<String>,
    pub providers: Vec<ProviderLyrics>,
}
