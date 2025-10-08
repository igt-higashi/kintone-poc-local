const { google } = require('googleapis');

// ダウンロードした Service Account の認証情報JSONを指定
const keys = require('./credentials/kintone-poc-dc42d154db9f.json');
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
// ファイル作成等も行いたいなら 'https://www.googleapis.com/auth/drive' も追加

module.exports = { getSheetsClient, readRange, writeRange };

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