/**
 * Google Sheets の指定した範囲にデータを書き込みます。
 *
 * 使い方:
 *   node writeSheets.js <RANGE> <JSON_VALUES>
 *   <JSON_VALUES> は 2次元配列の JSON 文字列
 *
 * RANGE の指定ルール:
 * - 開始セルのみを指定可能（例: Sheet2!A1）。
 *   この場合、開始セルから渡したデータの行数・列数に合わせて
 *   自動で終端セルを展開して書き込みます。
 * - 終端まで含む範囲を明示した場合（例: Sheet2!A1:B2 や Sheet2!A1:C10）、
 *   指定した範囲のセル数と渡すデータのサイズが一致しないとエラーになります。
 *
 * 例:
 *   node writeSheets.js Sheet2!A1 '[[\"A1\",\"B1\"],[\"A2\",\"B2\"]]'   // 開始セルのみ
 *   node writeSheets.js Sheet2!A1:B2 '[[\"A1\",\"B1\"],[\"A2\",\"B2\"]]'   // 範囲を明示（サイズ一致必須）
 */

// Google Sheets 書き込みスクリプト
const { spreadsheetId, writeRange } = require('./sheetsCommon');

(async () => {
  const [, , range, jsonValues] = process.argv;
  if (!range || !jsonValues) {
    console.error('Usage: node writeSheets.js <RANGE> <JSON_VALUES>');
    console.error(String.raw`Example: Quoting and escaping rules differ between shells.`);
    console.error(String.raw`- PowerShell: node writeSheets.js Sheet2!A1 '[[\"A1\",\"B1\"],[\"A2\",\"B2\"]]'`);
    console.error(String.raw`- cmd.exe  : node writeSheets.js "Sheet2!A1" "[[\"A1\",\"B1\"],[\"A2\",\"B2\"]]"`);
    process.exit(1);
  }
  let values;
  try {
    values = JSON.parse(jsonValues);
    if (!Array.isArray(values)) throw new Error('values must be a 2D array');
  } catch (err) {
    console.error('Invalid JSON_VALUES:', err.message);
    process.exit(1);
  }
  try {
    const res = await writeRange(spreadsheetId, range, values);
    console.log('Write result:', JSON.stringify(res, null, 2));
  } catch (err) {
    console.error('Error:', err.response?.data || err.message || err);
    process.exit(1);
  }
})();