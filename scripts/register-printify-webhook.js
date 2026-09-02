import https from 'https';
import fs from 'fs';

// For node >= 20, --env-file is used, but we'll manually load .env.local just in case they don't pass it
// Support both .env and .env.local
const envFiles = ['.env', '.env.local'].filter(f => fs.existsSync(f));

envFiles.forEach(envFile => {
  console.log(`\x1b[36m[i]\x1b[0m Loading credentials from ${envFile}...`);
  const envContent = fs.readFileSync(envFile, 'utf-8');
  envContent.split('\n').forEach(line => {
    const cleanLine = line.split('#')[0].trim();
    if (!cleanLine) return;

    const match = cleanLine.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let key = match[1];
      let value = match[2] || '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  });
});

if (envFiles.length === 0) {
  console.warn("\x1b[33m[!]\x1b[0m No .env or .env.local file found. Relying on existing environment variables.");
}

function httpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data: body });
      });
    });

    req.on('error', (e) => reject(e));

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function registerWebhook() {
  const shopId = process.env.PRINTIFY_SHOP_ID;
  const token = process.env.PRINTIFY_API_TOKEN || process.env.PRINTIFY_TOKEN;
  
  const BASE_URL = process.argv[2];
  const requestedTopic = process.argv[3]; // Optional 3rd argument
  
  if (!BASE_URL || BASE_URL.includes("your-vercel-domain")) {
    console.error("\x1b[41m\x1b[37m ERROR \x1b[0m Please provide your actual Public URL.");
    process.exit(1);
  }

  const targetUrl = `${BASE_URL.replace(/\/$/, '')}/api/webhooks/printify`;
  const topicsToTry = requestedTopic ? [requestedTopic] : ["product:published", "product:publish:finished", "product:updated", "order:created"];

  if (!shopId || !token) {
    console.error("\x1b[41m\x1b[37m ERROR \x1b[0m Missing credentials.");
    process.exit(1);
  }

  for (const topic of topicsToTry) {
    console.log(`\x1b[36m[i]\x1b[0m Attempting to register topic: \x1b[35m${topic}\x1b[0m...`);
    
    try {
      const payload = JSON.stringify({
        topic: topic,
        url: targetUrl
      });

      const options = {
        hostname: 'api.printify.com',
        port: 443,
        path: `/v1/shops/${shopId}/webhooks.json`,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      };

      const res = await httpsRequest(options, payload);
      
      if (res.statusCode >= 200 && res.statusCode < 300) {
        console.log(`\x1b[42m\x1b[30m SUCCESS \x1b[0m Registered: ${topic}`);
      } else {
        console.error(`\x1b[41m\x1b[31m FAIL \x1b[0m Topic: ${topic} | Status: ${res.statusCode}`);
        console.error(`         Response: ${res.data}`);
      }
    } catch (err) {
      console.error(`\x1b[41m\x1b[37m ERROR \x1b[0m ${err.message}`);
    }
  }
}

registerWebhook();
