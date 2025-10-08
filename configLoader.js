const fs = require('fs');
const configPath = './config/config.json';

function loadConfig() {
  if (!fs.existsSync(configPath)) {
    console.error(`Error: config.json が見つかりません (${configPath})`);
    process.exit(1);
  }

  try {
    const configData = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configData);
  } catch (err) {
    console.error('Error: config.json の読み込みに失敗しました。', err);
    process.exit(1);
  }
}

module.exports = { loadConfig };