/**
 * Kintone の担当者管理アプリからデータを取得し、Google Sheets にエクスポートするスクリプト
 * 
 * idで昇順ソートして出力
 * 取得したすべてのフィールドを出力
 */
const axios = require('axios');
const { loadJsonFile } = require('./fileLoader');
const { spreadsheetId, writeRange } = require('./sheetsCommon');

// Kintone 設定をロード
const kinotoneConfig = loadJsonFile('./config/kintone_config.json');
const { SUBDOMAIN, APP_ID_PIC, API_TOKEN_PIC } = kinotoneConfig;

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

    // 2. レコードを Google Sheets 用の 2D 配列に変換
    // レコードの最初のオブジェクトからフィールド名を取得してヘッダ行とする
    // Object.keys(record) はオブジェクトのキー名の配列を返す
    // これにより Google Sheets の列名として使える配列を作成
    const header = Object.keys(records[0]);
    //console.log(header);
    const values = [
      header,
      ...records.map(record => header.map(key => normalizeValue(record[key]?.value ?? '')))
    ];

    //console.log(JSON.stringify(values.slice(0, 3), null, 2));

    // 3. Google Sheets に書き込む
    const range = 'シート3!A1'; // 必要に応じて変更
    const res = await writeRange(spreadsheetId, range, values);
    console.log('書き込み完了:', JSON.stringify(res, null, 2));

  } catch (err) {
    console.error('エラー:', err.response?.data || err.message || err);
    process.exit(1);
  }
})();
