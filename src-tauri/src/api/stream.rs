use md5::{Md5, Digest};
use crate::models::{DownloadInfo, YandexResponse};
use super::client::YandexApiClient;

const SECRET_SALT: &str = "XGRjsaeHpOMIS23zpUtqxBiWhTXVeUQ8qAhscnPl";

impl YandexApiClient {
    pub async fn get_download_info(&self, track_id: &str) -> Result<Vec<DownloadInfo>, String> {
        let clean_id = track_id.split(':').next().unwrap_or(track_id).trim();
        let response = self.get(&format!("/tracks/{}/download-info", clean_id)).await?;
        let wrapper: YandexResponse<Vec<DownloadInfo>> = response
            .json()
            .await
            .map_err(|e| format!("Failed to parse download info: {}", e))?;

        let mut mp3_infos: Vec<DownloadInfo> = wrapper.result
            .into_iter()
            .filter(|info| info.codec.to_lowercase() == "mp3")
            .collect();

        mp3_infos.sort_by(|a, b| b.bitrate_in_kbps.cmp(&a.bitrate_in_kbps));
        Ok(mp3_infos)
    }

    pub async fn get_direct_link(&self, download_url: &str) -> Result<String, String> {
        let response = reqwest::get(download_url)
            .await
            .map_err(|e| format!("Failed to fetch direct link: {}", e))?;

        let xml_text = response
            .text()
            .await
            .map_err(|e| format!("Failed to read XML response: {}", e))?;

        let host = Self::extract_xml_tag(&xml_text, "host")
            .ok_or("Failed to extract host from XML")?;
        let path = Self::extract_xml_tag(&xml_text, "path")
            .ok_or("Failed to extract path from XML")?;
        let ts = Self::extract_xml_tag(&xml_text, "ts")
            .ok_or("Failed to extract ts from XML")?;
        let s = Self::extract_xml_tag(&xml_text, "s")
            .ok_or("Failed to extract s from XML")?;

        let path_without_slash = path.trim_start_matches('/');
        let sign_input = format!("{}{}{}", SECRET_SALT, path_without_slash, s);
        let mut hasher = Md5::new();
        hasher.update(sign_input.as_bytes());
        let hash = format!("{:x}", hasher.finalize());

        Ok(format!("https://{}/get-mp3/{}/{}{}", host, hash, ts, path))
    }

    fn extract_xml_tag(xml: &str, tag: &str) -> Option<String> {
        let start_tag = format!("<{}>", tag);
        let end_tag = format!("</{}>", tag);

        let start_pos = xml.find(&start_tag)? + start_tag.len();
        let end_pos = xml[start_pos..].find(&end_tag)? + start_pos;

        Some(xml[start_pos..end_pos].to_string())
    }
}
