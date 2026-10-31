use chrono::Utc;
use crate::models::{RotorSessionNewRequest, RotorSessionResponse, RotorStationTracks, Track, YandexResponse};
use super::client::YandexApiClient;

impl YandexApiClient {
    pub async fn get_wave_tracks(&self) -> Result<Vec<Track>, String> {
        let response = self.get("/rotor/station/user:onyourwave/tracks").await?;
        let wrapper: YandexResponse<RotorStationTracks> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse wave tracks: {}", e))?;

        Ok(wrapper.result.sequence.into_iter().map(|item| item.track).collect())
    }

    pub async fn start_wave_session(&self) -> Result<RotorSessionResponse, String> {
        let request_body = RotorSessionNewRequest {
            seeds: vec!["user:onyourwave".to_string()],
            include_tracks_in_response: true,
        };

        let response = self.post_json("/rotor/session/new", &request_body).await?;
        let wrapper: YandexResponse<RotorSessionResponse> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse rotor session response: {}", e))?;

        Ok(wrapper.result)
    }

    pub async fn get_next_wave_tracks(&self, session_id: &str, recent_track_ids: Vec<String>) -> Result<RotorStationTracks, String> {
        let url = format!("/rotor/session/{}/tracks", session_id);
        let body = serde_json::json!({ "queue": recent_track_ids });

        let response = self.post_json(&url, &body).await?;
        let wrapper: YandexResponse<RotorStationTracks> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse next wave tracks: {}", e))?;

        Ok(wrapper.result)
    }

    pub async fn send_rotor_feedback(
        &self,
        session_id: &str,
        batch_id: &str,
        event_type: &str,
        track_id: &str,
        played_seconds: f64,
    ) -> Result<(), String> {
        let url = format!("/rotor/session/{}/feedback", session_id);
        let payload = serde_json::json!({
            "batchId": batch_id,
            "event": {
                "type": event_type,
                "trackId": track_id,
                "totalPlayedSeconds": played_seconds,
                "timestamp": Utc::now().to_rfc3339()
            }
        });

        let _ = self.post_json(&url, &payload).await?;
        Ok(())
    }
}
