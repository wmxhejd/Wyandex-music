use std::collections::HashMap;
use crate::models::{LikedTracksResult, Track, YandexResponse};
use super::client::YandexApiClient;

impl YandexApiClient {
    pub async fn get_liked_track_ids(&self, uid: u64) -> Result<Vec<String>, String> {
        let response = self.get(&format!("/users/{}/likes/tracks", uid)).await?;
        let wrapper: YandexResponse<LikedTracksResult> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse liked tracks: {}", e))?;

        Ok(wrapper.result.library.tracks.into_iter().map(|item| item.id).collect())
    }

    pub async fn get_liked_tracks(&self, uid: u64) -> Result<Vec<Track>, String> {
        let response = self.get(&format!("/users/{}/likes/tracks", uid)).await?;
        let wrapper: YandexResponse<LikedTracksResult> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse liked tracks: {}", e))?;

        let track_ids: Vec<String> = wrapper.result.library.tracks
            .into_iter()
            .map(|item| {
                if let Some(album_id) = item.album_id {
                    format!("{}:{}", item.id, album_id)
                } else {
                    item.id
                }
            })
            .collect();

        if track_ids.is_empty() {
            return Ok(Vec::new());
        }

        let mut all_tracks = Vec::new();

        for chunk in track_ids.chunks(100) {
            let mut body = HashMap::new();
            body.insert("track-ids".to_string(), chunk.join(","));

            let response = self.post("/tracks", &body).await?;
            let wrapper: YandexResponse<Vec<Track>> = response
                .json()
                .await
                .map_err(|e| format!("Failed to parse track metadata: {}", e))?;

            all_tracks.extend(wrapper.result);
        }

        Ok(all_tracks)
    }

    pub async fn like_track(&self, uid: u64, track_id: &str) -> Result<(), String> {
        let clean_id = track_id.split(':').next().unwrap_or(track_id).trim();
        let mut body = HashMap::new();
        body.insert("track-ids".to_string(), clean_id.to_string());

        self.post(&format!("/users/{}/likes/tracks/add-multiple", uid), &body).await?;
        Ok(())
    }

    pub async fn unlike_track(&self, uid: u64, track_id: &str) -> Result<(), String> {
        let clean_id = track_id.split(':').next().unwrap_or(track_id).trim();
        let mut body = HashMap::new();
        body.insert("track-ids".to_string(), clean_id.to_string());

        self.post(&format!("/users/{}/likes/tracks/remove", uid), &body).await?;
        Ok(())
    }

    pub async fn check_is_liked(&self, uid: u64, track_id: &str) -> Result<bool, String> {
        let clean_id = track_id.split(':').next().unwrap_or(track_id).trim();
        let response = self.get(&format!("/users/{}/likes/tracks", uid)).await?;
        let wrapper: YandexResponse<LikedTracksResult> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse liked tracks: {}", e))?;

        Ok(wrapper.result.library.tracks.iter().any(|t| t.id == clean_id))
    }
}
