use serde::Deserialize;
use crate::models::{Playlist, Track, YandexResponse};
use super::client::YandexApiClient;

impl YandexApiClient {
    pub async fn get_playlists(&self, uid: u64) -> Result<Vec<Playlist>, String> {
        let response = self.get(&format!("/users/{}/playlists/list", uid)).await?;
        let wrapper: YandexResponse<Vec<Playlist>> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse playlists: {}", e))?;
        Ok(wrapper.result)
    }

    pub fn get_playlist_cover_url(&self, playlist: &Playlist, size: u32) -> Option<String> {
        let cover_uri = playlist.cover.as_ref().and_then(|c| {
            c.uri.clone()
                .or_else(|| c.items_uri.as_ref().and_then(|items| items.first().cloned()))
        }).or_else(|| playlist.og_image.clone());

        cover_uri.map(|uri| {
            let formatted = uri.replace("%%", &format!("{}x{}", size, size));
            if formatted.starts_with("http") {
                formatted
            } else {
                format!("https://{}", formatted)
            }
        })
    }

    pub async fn get_playlist_tracks(&self, uid: u64, kind: u64) -> Result<Vec<Track>, String> {
        let response = self.get(&format!("/users/{}/playlists/{}", uid, kind)).await?;

        #[derive(Debug, Deserialize)]
        struct PlaylistDetails {
            tracks: Vec<PlaylistTrackItem>,
        }

        #[derive(Debug, Deserialize)]
        struct PlaylistTrackItem {
            track: Track,
        }

        let wrapper: YandexResponse<PlaylistDetails> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse playlist tracks: {}", e))?;

        Ok(wrapper.result.tracks.into_iter().map(|item| item.track).collect())
    }
}
