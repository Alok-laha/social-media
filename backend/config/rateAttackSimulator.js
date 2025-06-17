const axios = require('axios');

async function sendRequest(id) {
  const fakeIP = `192.168.1.${Math.floor(Math.random() * 255)}`;

  try {
    const response = await axios.get(`http://localhost:4010/timeline/${id}`, {
      headers: {
        'User-Agent': `LoadTester`,
        'X-Forwarded-For': fakeIP
      },
      timeout: 5000
    });

    console.log(`✔️ Request #${id} → ${response.status}`);
  } catch (err) {
    console.log(`❌ Request #${id} → FAILED (${err.code || err.message})`);
  }
}

module.exports = {sendRequest};
