require('dotenv').config({ path: '/home/hussain/Documents/axray-signoz/apps/server/.env' });
const apiKey = process.env.SIGNOZ_API_KEY;
const url = 'https://us2.signoz.cloud/api/v1/rules';
fetch(url, {
  headers: {
    'SIGNOZ-ACCESS-TOKEN': apiKey
  }
}).then(r => r.json()).then(d => console.log(JSON.stringify(d, null, 2))).catch(e => console.error(e));
