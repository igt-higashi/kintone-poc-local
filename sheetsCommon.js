const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// ファイル作成等も行いたいなら 'https://www.googleapis.com/auth/drive' も追加

const { loadJsonFile } = require('./fileLoader');
const googleConfig = loadJsonFile('./config/google_config.json');
const { SPREADSHEET_ID } = googleConfig;
const spreadsheetId = SPREADSHEET_ID;
module.exports = { spreadsheetId, getSheetsClient, readRange, writeRange };
// 認証情報 JSON をロード
const credentialsPath = path.resolve(googleConfig.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_PATH);
if (!fs.existsSync(credentialsPath)) {
  console.error(`Error: 認証情報 JSON が見つかりません (${credentialsPath})`);
  process.exit(1);
}
const keys = require(credentialsPath);

async function getSheetsClient() {
  const client = new google.auth.JWT({
    email: keys.client_email,
    key: keys.private_key,
    scopes: SCOPES,
  });

  await client.authorize(); // 必要に応じて待つ
  const sheets = google.sheets({ version: 'v4', auth: client });
  return sheets;
}

async function readRange(spreadsheetId, range) {
  const sheets = await getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range, // 例: 'Sheet1!A1:C10'
  });
  return res.data;
}

async function writeRange(spreadsheetId, range, values) {
  // Google API クライアントを取得
  const sheets = await getSheetsClient();
  // Google Sheets API の「更新」メソッドを呼び出し
  const res = await sheets.spreadsheets.values.update({
    spreadsheetId, // スプレッドシートのID
    range, // 書き込み先の範囲
    valueInputOption: 'RAW', // or 'USER_ENTERED'
    // 値の扱い方を指定。
    // "RAW" = そのままの値で入力
    // "USER_ENTERED" = ユーザーがセルに入力するのと同じ扱い（数式や日付の自動変換など）
    requestBody: {
      values, // 書き込むデータの2次元配列: [[col1, col2], [..]]
    },
  });
  return res.data;
}

// // 使用例
// (async () => {
//     const spreadsheetId = '1a66YzD8sXgNRh4GpwuD5FlItXlIJ-t_Yvzdevcl_7dM';//'YOUR_SPREADSHEET_ID';
//     console.log(await readRange(spreadsheetId, 'Sheet1!A1:A5'));
//     await writeRange(spreadsheetId, 'Sheet1!B1', [['Hello from Node.js']]);
// })();