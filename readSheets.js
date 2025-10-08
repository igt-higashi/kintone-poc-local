/**
 * Google Sheets から指定した範囲のデータを読み込みます。
 * 
 * 使い方:
 * node readSheets.js <RANGE>
 * 例: node readSheets.js Sheet1!A1:C10
 */

// Google Sheets 読み込みスクリプト
const { spreadsheetId, readRange } = require('./sheetsCommon');

(async () => {
    const [, , range] = process.argv;
    if (!range) {
        console.error('Usage: node readSheets.js <RANGE>');
        console.error('Example: node readSheets.js Sheet1!A1:C10');
        process.exit(1);
    }
    try {
        const data = await readRange(spreadsheetId, range);
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Error:', err.response?.data || err.message || err);
        process.exit(1);
    }
})();