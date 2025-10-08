

/**
 * Kintone REST API を使用して、指定したアプリに新しいレコードを追加します。
 * 
 * このスクリプトは、Kintone REST API の `/k/v1/record.json` エンドポイントにPOST リクエストを送信し、
 * 指定されたフィールド値を持つレコードを作成します。
 * 
 * ルックアップフィールドを登録する際には、ルックアップ元アプリのAPIトークンも必要です。
 * 参考URL: https://cybozu.dev/ja/kintone/docs/rest-api/overview/authentication/#api-token
 */

const axios = require('axios');
const fs = require('fs');
const configPath = './config/config.json';
if (!fs.existsSync(configPath)) {
  console.error('Error: config.json が見つかりません。');
  process.exit(1);
}
const config = require(configPath);
const { SUBDOMAIN, APP_ID_PIC, API_TOKEN_PIC, API_TOKEN_CUSTOMER } = config;
// SUBDOMAIN: Kintoneのサブドメイン
// APP_ID_PIC: 担当者管理アプリのID
// const API_TOKEN_PIC: 担当者管理アプリのAPIトークン
// const API_TOKEN_CUSTOMER: 顧客管理アプリ（ルックアップ元）のAPIトークン

(async () => {
  try {
    const response = await axios.post(
      `https://${SUBDOMAIN}.cybozu.com/k/v1/record.json`,
      {
        app: APP_ID_PIC,
        record: {
          // ルックアップキーとなるフィールドに値を設定
          // 顧客No.などのコピーされるフィールドは自動でセットされる
          顧客名: { value: '株式会社サイボウズ商事' },
          姓: { value: '山田' },
          名: { value: '太郎' },
          姓_フリガナ: { value: 'ヤマダ' },
          名_フリガナ: { value: 'タロウ' },
          部署: { value: '営業部' },
          役職: { value: '部長' },
          電話番号: { value: '03-1234-5678' },
          携帯番号: { value: '090-1234-5678' },
          メールアドレス: { value: 'test@example.com' },
          決裁権: { value: 'あり' },
          // 備考はMULTI_LINE_TEXT
          備考: { value: '備考行1\n備考行2\n備考行3' },
        }
      },
      {
        headers: {
          'X-Cybozu-API-Token': `${API_TOKEN_PIC},${API_TOKEN_CUSTOMER}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('登録成功:', response.data);
  } catch (err) {
    console.error('登録失敗:', err.response?.data || err.message);
  }
})();
