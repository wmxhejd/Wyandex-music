use crate::models::{Account, AccountStatusResult, YandexConfig, YandexResponse};
use super::client::YandexApiClient;

impl YandexApiClient {
    pub async fn get_account_status(&self) -> Result<Account, String> {
        let response = self.get("/account/status").await?;
        let wrapper: YandexResponse<AccountStatusResult> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse account status: {}", e))?;
        Ok(wrapper.result.account)
    }
}

pub fn save_config(config: &YandexConfig) -> Result<(), String> {
    let config_dir = dirs::config_dir()
        .ok_or("Failed to get config directory")?
        .join("wyandexmusic");

    std::fs::create_dir_all(&config_dir)
        .map_err(|e| format!("Failed to create config directory: {}", e))?;

    let config_path = config_dir.join("session.json");
    let json = serde_json::to_string_pretty(config)
        .map_err(|e| format!("Failed to serialize config: {}", e))?;

    std::fs::write(config_path, json)
        .map_err(|e| format!("Failed to write config: {}", e))?;

    Ok(())
}

pub fn load_config() -> Result<YandexConfig, String> {
    let new_config_path = dirs::config_dir()
        .ok_or("Failed to get config directory")?
        .join("wyandexmusic")
        .join("session.json");

    if new_config_path.exists() {
        let json = std::fs::read_to_string(&new_config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;

        return serde_json::from_str(&json)
            .map_err(|e| format!("Failed to parse config: {}", e));
    }

    let old_config_path = dirs::config_dir()
        .ok_or("Failed to get config directory")?
        .join("yandexarbuz")
        .join("session.json");

    if old_config_path.exists() {
        let json = std::fs::read_to_string(&old_config_path)
            .map_err(|e| format!("Failed to read old config: {}", e))?;

        let config: YandexConfig = serde_json::from_str(&json)
            .map_err(|e| format!("Failed to parse old config: {}", e))?;

        let _ = save_config(&config);
        return Ok(config);
    }

    Ok(YandexConfig {
        access_token: None,
        user_id: None,
    })
}
