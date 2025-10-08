const fs = require('fs');
const path = require('path');

/**
 * 設定ファイルを読み込む
 * @param {string} [configPath] - 設定ファイルのパス'
 * @returns {Object} 設定オブジェクト
 */
function loadConfig(configPath = './config/google_config.json') {
  const resolvedPath = path.resolve(configPath);

  if (!fs.existsSync(resolvedPath)) {
    console.error(`Error: 設定ファイルが見つかりません (${resolvedPath})`);
    process.exit(1);
  }

  try {
    const configData = fs.readFileSync(resolvedPath, 'utf-8');
    return JSON.parse(configData);
  } catch (err) {
    console.error(`Error: 設定ファイルの読み込みに失敗しました (${resolvedPath})`, err);
    process.exit(1);
  }
}

module.exports = { loadConfig };