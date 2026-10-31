use tauri::{State, Manager, Emitter, WebviewUrl, WebviewWindowBuilder};
use crate::models::{LyricsResult, YandexConfig};
use crate::api::{YandexApiClient, save_config};
use crate::AppState;

const YANDEX_OAUTH_URL: &str = "https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d";

#[tauri::command]
pub async fn open_auth_window(app: tauri::AppHandle) -> Result<(), String> {
    let app_handle = app.clone();

    let _auth_window = WebviewWindowBuilder::new(
        &app,
        "yandex-auth",
        WebviewUrl::External(YANDEX_OAUTH_URL.parse().unwrap())
    )
    .title("Вход в Яндекс")
    .inner_size(520.0, 720.0)
    .center()
    .resizable(false)
    .on_navigation(move |url| {
        let url_str = url.as_str();

        if url_str.contains("access_token=") {
            let token_opt = url_str.split('#').nth(1)
                .and_then(|fragment| {
                    fragment.split('&')
                        .find(|param| param.starts_with("access_token="))
                        .map(|param| param.trim_start_matches("access_token=").to_string())
                })
                .or_else(|| {
                    url_str.split('?').nth(1)
                        .and_then(|query| {
                            query.split('&')
                                .find(|param| param.starts_with("access_token="))
                                .map(|param| param.trim_start_matches("access_token=").to_string())
                        })
                });

            if let Some(token) = token_opt {
                let app_clone = app_handle.clone();

                tauri::async_runtime::spawn(async move {
                    let api_client = YandexApiClient::new(token.clone());

                    let user_id = if let Ok(account) = api_client.get_account_status().await {
                        Some(account.uid.to_string())
                    } else {
                        None
                    };

                    let config = YandexConfig {
                        access_token: Some(token.clone()),
                        user_id: user_id.clone(),
                    };

                    if save_config(&config).is_ok() {
                        if let Some(state) = app_clone.try_state::<AppState>() {
                            *state.api_client.lock().unwrap() = Some(YandexApiClient::new(token.clone()));
                            let mut state_config = state.config.lock().unwrap();
                            state_config.access_token = Some(token);
                            state_config.user_id = user_id;
                        }

                        let _ = app_clone.emit("auth-success", ());

                        if let Some(window) = app_clone.get_webview_window("yandex-auth") {
                            let _ = window.close();
                        }
                    }
                });

                return false;
            }
        }
        true
    })
    .build()
    .map_err(|e| format!("Failed to create auth window: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn save_token(token: String, state: State<'_, AppState>, app: tauri::AppHandle) -> Result<(), String> {
    let api_client = YandexApiClient::new(token.clone());
    let account = api_client.get_account_status().await?;

    let mut config = state.config.lock().unwrap();
    config.access_token = Some(token.clone());
    config.user_id = Some(account.uid.to_string());

    save_config(&config)?;
    *state.api_client.lock().unwrap() = Some(api_client);

    let _ = app.emit("auth-success", ());

    if let Some(window) = app.get_webview_window("yandex-auth") {
        let _ = window.close();
    }

    Ok(())
}

#[tauri::command]
pub async fn get_account_info(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    let account = client.get_account_status().await?;
    serde_json::to_value(account).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn get_stream_url(track_id: String, state: State<'_, AppState>) -> Result<String, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    let download_info = client.get_download_info(&track_id).await?;

    let best_quality = download_info.into_iter().next().ok_or("No download info available")?;
    client.get_direct_link(&best_quality.download_info_url).await
}

#[tauri::command]
pub async fn get_liked_track_ids(state: State<'_, AppState>) -> Result<Vec<String>, String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    client.get_liked_track_ids(uid).await
}

#[tauri::command]
pub async fn get_liked_tracks(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    let tracks = client.get_liked_tracks(uid).await?;
    serde_json::to_value(tracks).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn get_playlists(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    let playlists = client.get_playlists(uid).await?;
    serde_json::to_value(playlists).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn get_wave_tracks(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    let tracks = client.get_wave_tracks().await?;
    serde_json::to_value(tracks).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn start_wave_session(state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    let session_response = client.start_wave_session().await?;

    {
        let mut rotor_session = state.rotor_session.lock().unwrap();
        *rotor_session = Some(crate::RotorSession {
            session_id: session_response.radio_session_id.clone(),
            batch_id: session_response.batch_id.clone(),
        });
    }

    serde_json::to_value(session_response).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn get_next_wave_tracks(recent_track_ids: Vec<String>, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let session_id = {
        let rotor_session = state.rotor_session.lock().unwrap();
        rotor_session.as_ref().ok_or("No active rotor session")?.session_id.clone()
    };

    let client = YandexApiClient::new(token);
    let tracks_response = client.get_next_wave_tracks(&session_id, recent_track_ids).await?;

    if let Some(ref batch_id) = tracks_response.batch_id {
        let mut rotor_session = state.rotor_session.lock().unwrap();
        if let Some(ref mut session) = *rotor_session {
            session.batch_id = batch_id.clone();
        }
    }

    serde_json::to_value(tracks_response).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn send_rotor_feedback(
    event_type: String,
    track_id: String,
    played_seconds: f64,
    state: State<'_, AppState>,
) -> Result<(), String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let (session_id, batch_id) = {
        let rotor_session = state.rotor_session.lock().unwrap();
        let session = rotor_session.as_ref().ok_or("No active rotor session")?;
        (session.session_id.clone(), session.batch_id.clone())
    };

    let client = YandexApiClient::new(token);
    client.send_rotor_feedback(&session_id, &batch_id, &event_type, &track_id, played_seconds).await
}

#[tauri::command]
pub async fn like_track(track_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    client.like_track(uid, &track_id).await
}

#[tauri::command]
pub async fn unlike_track(track_id: String, state: State<'_, AppState>) -> Result<(), String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    client.unlike_track(uid, &track_id).await
}

#[tauri::command]
pub async fn get_lyrics(
    track_id: String,
    artist: String,
    title: String,
    duration_ms: u64,
    state: State<'_, AppState>,
) -> Result<LyricsResult, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    client.get_lyrics(&track_id, &artist, &title, duration_ms).await
}

#[tauri::command]
pub fn check_auth(state: State<'_, AppState>) -> bool {
    state.config.lock().unwrap().access_token.is_some()
}

#[tauri::command]
pub async fn search_tracks(query: String, search_type: Option<String>, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    let tracks = client.search_tracks(&query, search_type.as_deref()).await?;
    serde_json::to_value(tracks).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn search_all(query: String, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    let results = client.search_all(&query).await?;
    serde_json::to_value(results).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn get_playlist_tracks(kind: u64, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    let tracks = client.get_playlist_tracks(uid, kind).await?;
    serde_json::to_value(tracks).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn toggle_like_track(track_id: String, state: State<'_, AppState>) -> Result<bool, String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    let is_liked = client.check_is_liked(uid, &track_id).await?;

    if is_liked {
        client.unlike_track(uid, &track_id).await?;
        Ok(false)
    } else {
        client.like_track(uid, &track_id).await?;
        Ok(true)
    }
}

#[tauri::command]
pub async fn check_is_liked(track_id: String, state: State<'_, AppState>) -> Result<bool, String> {
    let (token, uid) = {
        let config = state.config.lock().unwrap();
        let token = config.access_token.clone().ok_or("Not authenticated")?;
        let uid = config.user_id.as_ref()
            .ok_or("User ID not found")?
            .parse::<u64>()
            .map_err(|e| format!("Invalid user ID: {}", e))?;
        (token, uid)
    };

    let client = YandexApiClient::new(token);
    client.check_is_liked(uid, &track_id).await
}

#[tauri::command]
pub fn logout(state: State<'_, AppState>) -> Result<(), String> {
    let mut config = state.config.lock().unwrap();
    config.access_token = None;
    config.user_id = None;
    *state.api_client.lock().unwrap() = None;
    save_config(&config)
}

#[tauri::command]
pub async fn get_artist_info(artist_id: String, state: State<'_, AppState>) -> Result<serde_json::Value, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };

    let client = YandexApiClient::new(token);
    let info = client.get_artist_brief_info(&artist_id).await?;
    serde_json::to_value(info).map_err(|e| format!("Serialization failed: {}", e))
}

#[tauri::command]
pub async fn get_album_with_tracks(album_id: u64, state: State<'_, AppState>) -> Result<crate::api::albums::AlbumWithTracks, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };
    let client = YandexApiClient::new(token);
    client.get_album_with_tracks(album_id).await
}

#[tauri::command]
pub async fn search_albums(query: String, state: State<'_, AppState>) -> Result<Vec<crate::api::albums::SearchAlbumItem>, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };
    let client = YandexApiClient::new(token);
    client.search_albums(&query).await
}

#[tauri::command]
pub async fn get_artist_tracks(artist_id: String, state: State<'_, AppState>) -> Result<Vec<crate::models::Track>, String> {
    let token = {
        let config = state.config.lock().unwrap();
        config.access_token.clone().ok_or("Not authenticated")?
    };
    let client = YandexApiClient::new(token);
    client.get_artist_tracks(&artist_id, 0, 100).await
}
