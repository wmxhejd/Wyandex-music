use std::collections::HashMap;
use serde::Serialize;

pub const API_BASE: &str = "https://api.music.yandex.net";
pub const USER_AGENT: &str = "YandexMusic/2024.01.1 (Android; 14)";

pub struct YandexApiClient {
    pub client: reqwest::Client,
    pub token: String,
}

impl YandexApiClient {
    pub fn new(token: String) -> Self {
        let client = reqwest::Client::builder()
            .user_agent(USER_AGENT)
            .build()
            .expect("Failed to create HTTP client");

        Self { client, token }
    }

    pub async fn get(&self, endpoint: &str) -> Result<reqwest::Response, String> {
        self.client
            .get(format!("{}{}", API_BASE, endpoint))
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Accept", "application/json")
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))
    }

    pub async fn post(&self, endpoint: &str, body: &HashMap<String, String>) -> Result<reqwest::Response, String> {
        self.client
            .post(format!("{}{}", API_BASE, endpoint))
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Accept", "application/json")
            .form(body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))
    }

    pub async fn post_json<T: Serialize>(&self, endpoint: &str, body: &T) -> Result<reqwest::Response, String> {
        self.client
            .post(format!("{}{}", API_BASE, endpoint))
            .header("Authorization", format!("OAuth {}", self.token))
            .header("Content-Type", "application/json")
            .header("Accept", "application/json")
            .json(body)
            .send()
            .await
            .map_err(|e| format!("Request failed: {}", e))
    }
}
