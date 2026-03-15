use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use serde::Deserialize;
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Mutex;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};
use tauri::{AppHandle, Manager, WindowEvent};
use tauri_plugin_autostart::ManagerExt as AutostartExt;
#[cfg(target_os = "macos")]
use tauri::ActivationPolicy;

struct RpcState {
    clients: Mutex<HashMap<String, DiscordIpcClient>>,
}

struct RuntimeState {
    quitting: AtomicBool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PresenceInput {
    activity_type: Option<String>,
    details: Option<String>,
    state: Option<String>,
    large_image_key: Option<String>,
    large_image_text: Option<String>,
    small_image_key: Option<String>,
    small_image_text: Option<String>,
    start_timestamp: Option<i64>,
    end_timestamp: Option<i64>,
    button1_label: Option<String>,
    button1_url: Option<String>,
    button2_label: Option<String>,
    button2_url: Option<String>,
}

fn normalize(value: Option<String>) -> Option<String> {
    value.and_then(|v| {
        let trimmed = v.trim();
        if trimmed.is_empty() {
            None
        } else {
            Some(trimmed.to_owned())
        }
    })
}

fn normalize_id(client_id: String) -> Result<String, String> {
    let id = client_id.trim();
    if id.is_empty() {
        return Err("Client ID is required.".to_owned());
    }
    Ok(id.to_owned())
}

fn parse_activity_type(value: &str) -> Result<activity::ActivityType, String> {
    match value {
        "playing" => Ok(activity::ActivityType::Playing),
        "listening" => Ok(activity::ActivityType::Listening),
        "watching" => Ok(activity::ActivityType::Watching),
        "competing" => Ok(activity::ActivityType::Competing),
        _ => Err("Activity type must be: playing, listening, watching, or competing.".to_owned()),
    }
}

fn show_main_window(app: &AppHandle) {
    #[cfg(target_os = "macos")]
    let _ = app.set_activation_policy(ActivationPolicy::Regular);

    if let Some(window) = app.get_webview_window("main") {
        let _ = window.set_skip_taskbar(false);
        let _ = window.show();
        let _ = window.unminimize();
        let _ = window.set_focus();
    }
}

fn create_tray(app: &AppHandle) -> tauri::Result<()> {
    let show = MenuItem::with_id(app, "show", "Show RPC Studio", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit RPC Studio", true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&show, &quit])?;

    let mut builder = TrayIconBuilder::with_id("rpc-studio-tray")
        .menu(&menu)
        .tooltip("RPC Studio")
        .icon_as_template(true)
        .show_menu_on_left_click(false)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "show" => show_main_window(app),
            "quit" => {
                app.state::<RuntimeState>()
                    .quitting
                    .store(true, Ordering::SeqCst);
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::Click {
                button: MouseButton::Left,
                button_state: MouseButtonState::Up,
                ..
            } = event
            {
                show_main_window(tray.app_handle());
            }
        });

    if let Some(icon) = app.default_window_icon().cloned() {
        builder = builder.icon(icon);
    }

    let _ = builder.build(app)?;
    Ok(())
}

#[tauri::command]
fn autostart_is_enabled(app: AppHandle) -> Result<bool, String> {
    app.autolaunch().is_enabled().map_err(|e| e.to_string())
}

#[tauri::command]
fn autostart_set_enabled(enabled: bool, app: AppHandle) -> Result<(), String> {
    if enabled {
        app.autolaunch().enable().map_err(|e| e.to_string())
    } else {
        app.autolaunch().disable().map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn rpc_connect(client_id: String, rpc_state: tauri::State<RpcState>) -> Result<(), String> {
    let id = normalize_id(client_id)?;

    let mut client = DiscordIpcClient::new(id.as_str()).map_err(|e| e.to_string())?;
    client.connect().map_err(|e| e.to_string())?;

    let mut clients = rpc_state
        .clients
        .lock()
        .map_err(|_| "Failed to access RPC state.".to_owned())?;

    if let Some(existing) = clients.get_mut(id.as_str()) {
        let _ = existing.clear_activity();
        let _ = existing.close();
    }

    clients.insert(id, client);
    Ok(())
}

#[tauri::command]
fn rpc_set_presence(
    client_id: String,
    presence: PresenceInput,
    rpc_state: tauri::State<RpcState>,
) -> Result<(), String> {
    let id = normalize_id(client_id)?;

    let mut clients = rpc_state
        .clients
        .lock()
        .map_err(|_| "Failed to access RPC state.".to_owned())?;
    let client = clients
        .get_mut(id.as_str())
        .ok_or_else(|| "Connect this Client ID first.".to_owned())?;

    let details = normalize(presence.details);
    let state = normalize(presence.state);
    let activity_type = normalize(presence.activity_type).map(|v| v.to_lowercase());
    let large_image_key = normalize(presence.large_image_key);
    let large_image_text = normalize(presence.large_image_text);
    let small_image_key = normalize(presence.small_image_key);
    let small_image_text = normalize(presence.small_image_text);
    let button1_label = normalize(presence.button1_label);
    let button1_url = normalize(presence.button1_url);
    let button2_label = normalize(presence.button2_label);
    let button2_url = normalize(presence.button2_url);

    let mut rich_presence = activity::Activity::new();

    if let Some(details) = details.as_deref() {
        rich_presence = rich_presence.details(details);
    }
    if let Some(state) = state.as_deref() {
        rich_presence = rich_presence.state(state);
    }
    if let Some(activity_type) = activity_type.as_deref() {
        rich_presence = rich_presence.activity_type(parse_activity_type(activity_type)?);
    }

    let mut assets = activity::Assets::new();
    let mut has_assets = false;

    if let Some(key) = large_image_key.as_deref() {
        assets = assets.large_image(key);
        has_assets = true;
    }
    if let Some(text) = large_image_text.as_deref() {
        assets = assets.large_text(text);
        has_assets = true;
    }
    if let Some(key) = small_image_key.as_deref() {
        assets = assets.small_image(key);
        has_assets = true;
    }
    if let Some(text) = small_image_text.as_deref() {
        assets = assets.small_text(text);
        has_assets = true;
    }
    if has_assets {
        rich_presence = rich_presence.assets(assets);
    }

    if presence.start_timestamp.is_some() || presence.end_timestamp.is_some() {
        let mut timestamps = activity::Timestamps::new();
        if let Some(start) = presence.start_timestamp {
            timestamps = timestamps.start(start);
        }
        if let Some(end) = presence.end_timestamp {
            timestamps = timestamps.end(end);
        }
        rich_presence = rich_presence.timestamps(timestamps);
    }

    let mut buttons = Vec::new();
    if let (Some(label), Some(url)) = (button1_label.as_deref(), button1_url.as_deref()) {
        buttons.push(activity::Button::new(label, url));
    }
    if let (Some(label), Some(url)) = (button2_label.as_deref(), button2_url.as_deref()) {
        buttons.push(activity::Button::new(label, url));
    }
    if !buttons.is_empty() {
        rich_presence = rich_presence.buttons(buttons);
    }

    client
        .set_activity(rich_presence)
        .map_err(|e| format!("Could not set presence: {e}"))?;

    Ok(())
}

#[tauri::command]
fn rpc_clear_presence(client_id: String, rpc_state: tauri::State<RpcState>) -> Result<(), String> {
    let id = normalize_id(client_id)?;

    let mut clients = rpc_state
        .clients
        .lock()
        .map_err(|_| "Failed to access RPC state.".to_owned())?;
    let client = clients
        .get_mut(id.as_str())
        .ok_or_else(|| "Connect this Client ID first.".to_owned())?;

    client
        .clear_activity()
        .map_err(|e| format!("Could not clear presence: {e}"))?;
    Ok(())
}

#[tauri::command]
fn rpc_disconnect(client_id: String, rpc_state: tauri::State<RpcState>) -> Result<(), String> {
    let id = normalize_id(client_id)?;

    let mut clients = rpc_state
        .clients
        .lock()
        .map_err(|_| "Failed to access RPC state.".to_owned())?;

    if let Some(mut client) = clients.remove(id.as_str()) {
        let _ = client.clear_activity();
        let _ = client.close();
    }

    Ok(())
}

#[tauri::command]
fn rpc_disconnect_all(rpc_state: tauri::State<RpcState>) -> Result<(), String> {
    let mut clients = rpc_state
        .clients
        .lock()
        .map_err(|_| "Failed to access RPC state.".to_owned())?;

    for (_, mut client) in clients.drain() {
        let _ = client.clear_activity();
        let _ = client.close();
    }

    Ok(())
}

#[tauri::command]
fn rpc_list_connected(rpc_state: tauri::State<RpcState>) -> Result<Vec<String>, String> {
    let clients = rpc_state
        .clients
        .lock()
        .map_err(|_| "Failed to access RPC state.".to_owned())?;
    let mut ids = clients.keys().cloned().collect::<Vec<String>>();
    ids.sort();
    Ok(ids)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(RpcState {
            clients: Mutex::new(HashMap::new()),
        })
        .manage(RuntimeState {
            quitting: AtomicBool::new(false),
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .setup(|app| {
            create_tray(&app.handle())?;

            if let Ok(false) = app.autolaunch().is_enabled() {
                let _ = app.autolaunch().enable();
            }

            Ok(())
        })
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if window.label() == "main" {
                    let runtime = window.state::<RuntimeState>();
                    if !runtime.quitting.load(Ordering::SeqCst) {
                        api.prevent_close();
                        #[cfg(target_os = "macos")]
                        let _ = window.app_handle().set_activation_policy(ActivationPolicy::Accessory);
                        let _ = window.set_skip_taskbar(true);
                        let _ = window.hide();
                    }
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            autostart_is_enabled,
            autostart_set_enabled,
            rpc_connect,
            rpc_set_presence,
            rpc_clear_presence,
            rpc_disconnect,
            rpc_disconnect_all,
            rpc_list_connected
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
