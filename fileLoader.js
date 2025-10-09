const fs = require('fs');
const path = require('path');

/**
 * JSONファイルを読み込む
 * @param {string} [filePath] - 読み込むJSONファイルのパス'
 * @returns {Object} JSONオブジェクト
 */
function loadJsonFile(filePath = './config/google_config.json') {
  const resolvedPath = path.resolve(filePath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: ファイルが見つかりません (${resolvedPath})`);
    process.exit(1);
  }

  try {
    const fileData = fs.readFileSync(resolvedPath, 'utf-8');
    return JSON.parse(fileData);
  } catch (err) {
    console.error(`Error: 設定ファイルの読み込みに失敗しました (${resolvedPath})`, err);
    process.exit(1);
  }
}

module.exports = { loadJsonFile };