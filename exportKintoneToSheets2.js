/**
 * Kintone の担当者管理アプリからデータを取得し、Google Sheets にエクスポートするスクリプト
 * 
 * idで昇順ソートして出力
 * outputFieldsで出力するフィールドとその順序を指定(外部JSONから読み込み)
 * 指定外のフィールドは出力しない
 */
const axios = require('axios');
const { loadConfig } = require('./configLoader');
const { spreadsheetId, writeRange } = require('./sheetsCommon');

// Kintone 設定をロード
const kinotoneConfig = loadConfig('./config/kintone_config.json');
const { SUBDOMAIN, APP_ID_PIC, API_TOKEN_PIC } = kinotoneConfig;

// outputFields を外部 JSON からロード
const outputFields = loadConfig('./settings/outputFields.json');

function normalizeValue(v) {
  if (Array.isArray(v)) {
    if (v.length === 0) return ''; // 空配列は空文字に
    return v.map(item => {
      if (typeof item === 'object') {
        return item.name || item.value || item.code || JSON.stringify(item);
      }
      return item;
    }).join(', ');
  }
  if (typeof v === 'object' && v !== null) {
    // オブジェクトは name や code があればそれを優先
    return v.name || v.code || JSON.stringify(v);
  }
  return v ?? '';
}

(async () => {
  try {
    // 1. Kintone からレコードを取得
    const response = await axios.get(
      `https://${SUBDOMAIN}.cybozu.com/k/v1/records.json`,
      {
        params: {
          app: APP_ID_PIC,
          query: 'order by $id asc' // $id で昇順ソート
        },
        headers: { 'X-Cybozu-API-Token': API_TOKEN_PIC }
      }
    );
    const records = response.data.records;
    console.log(`取得成功: ${records.length} 件`);
    //console.log(JSON.stringify(records, null, 2));

    if (records.length === 0) {
      console.log('レコードがありません。処理を終了します。');
      return;
    }

    // 2. Google Sheets 用 2D 配列に変換
    const values = [
      outputFields, // ヘッダ行
      ...records.map(record =>
        outputFields.map(key => normalizeValue(record[key]?.value ?? ''))
      )
    ];

    // 3. Google Sheets に書き込み
    const range = 'シート3!A1';
    const res = await writeRange(spreadsheetId, range, values);
    console.log('書き込み完了:', JSON.stringify(res, null, 2));


  } catch (err) {
    console.error('エラー:', err.response?.data || err.message || err);
    process.exit(1);
  }
})();
