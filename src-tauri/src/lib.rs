pub mod models;
pub mod api;
pub mod commands;

use std::sync::Mutex;
use tauri::{Manager, Emitter, tray::{TrayIconBuilder, MouseButton, MouseButtonState}, menu::{MenuBuilder, MenuItemBuilder}};
use models::YandexConfig;
use api::{YandexApiClient, load_config};

pub struct AppState {
    pub api_client: Mutex<Option<YandexApiClient>>,
    pub config: Mutex<YandexConfig>,
    pub rotor_session: Mutex<Option<RotorSession>>,
}

#[derive(Clone)]
pub struct RotorSession {
    pub session_id: String,
    pub batch_id: String,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let config = load_config().unwrap_or(YandexConfig {
        access_token: None,
        user_id: None,
    });

    let api_client = config.access_token.as_ref().map(|token| YandexApiClient::new(token.clone()));

    let app_state = AppState {
        api_client: Mutex::new(api_client),
        config: Mutex::new(config),
        rotor_session: Mutex::new(None),
    };

    tauri::Builder::default()
    .plugin(tauri_plugin_opener::init())
    .plugin(tauri_plugin_shell::init())
    .manage(app_state)
    .setup(|app| {
        let show_item = MenuItemBuilder::with_id("show", "Открыть Wyandexmusic").build(app)?;
        let play_pause_item = MenuItemBuilder::with_id("play_pause", "Воспроизведение / Пауза").build(app)?;
        let next_item = MenuItemBuilder::with_id("next", "Следующий трек").build(app)?;
        let prev_item = MenuItemBuilder::with_id("prev", "Предыдущий трек").build(app)?;
        let quit_item = MenuItemBuilder::with_id("quit", "Выход").build(app)?;

        let menu = MenuBuilder::new(app)
        .item(&show_item)
        .separator()
        .item(&play_pause_item)
        .item(&next_item)
        .item(&prev_item)
        .separator()
        .item(&quit_item)
        .build()?;

        let _tray = TrayIconBuilder::new()
        .menu(&menu)
        .icon(app.default_window_icon().unwrap().clone())
        .tooltip("Wyandexmusic")
        .on_menu_event(move |app, event| {
            match event.id().as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "play_pause" => {
                    let _ = app.emit("tray-play-pause", ());
                }
                "next" => {
                    let _ = app.emit("tray-next", ());
                }
                "prev" => {
                    let _ = app.emit("tray-prev", ());
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(|tray, event| {
            if let tauri::tray::TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                let app = tray.app_handle();
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }
        })
        .build(app)?;

        if let Some(window) = app.get_webview_window("main") {
            let window_clone = window.clone();
            window.on_window_event(move |event| {
                if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                    let _ = window_clone.hide();
                    api.prevent_close();
                }
            });
            let _ = window.show();
        }

        Ok(())
    })
    .invoke_handler(tauri::generate_handler![
        commands::open_auth_window,
        commands::save_token,
        commands::get_account_info,
        commands::get_stream_url,
        commands::get_liked_tracks,
        commands::get_liked_track_ids,
        commands::get_playlists,
        commands::get_playlist_tracks,
        commands::search_tracks,
        commands::search_all,
        commands::get_wave_tracks,
        commands::start_wave_session,
        commands::get_next_wave_tracks,
        commands::send_rotor_feedback,
        commands::like_track,
        commands::unlike_track,
        commands::toggle_like_track,
        commands::check_is_liked,
        commands::get_lyrics,
        commands::check_auth,
        commands::logout,
        commands::get_artist_info,
        commands::get_artist_tracks,
        commands::get_album_with_tracks,
        commands::search_albums,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
