/**
 * Kintone REST API を使用して 指定したアプリからレコードを取得します。
 * 
 * このスクリプトは Kintone REST API の `/k/v1/records.json` エンドポイントにGET リクエストを送信し、
 * アプリ内のレコードを JSON 形式で取得します。
 */

const axios = require('axios');
const { loadJsonFile } = require('./fileLoader');
const kinotoneConfig = loadJsonFile('./config/kintone_config.json');
const { SUBDOMAIN, APP_ID_PIC, API_TOKEN_PIC } = kinotoneConfig;

(async () => {
  try {
    const response = await axios.get(
      `https://${SUBDOMAIN}.cybozu.com/k/v1/records.json`,
      {
        // 5件だけ取得するクエリ
        // params: { app: APP_ID, query: 'limit 5' },
        // 全件取得（最大500件まで）
        params: { app: APP_ID_PIC, },
        headers: {
          'X-Cybozu-API-Token': API_TOKEN_PIC
        }
      }
    );
    console.log('取得成功:', response.data.records);
  } catch (err) {
    console.error('エラー:', err.response?.data || err.message);
  }
})();
