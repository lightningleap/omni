
const fs = require('fs');
const path = require('path');

function getEnvToken() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error(`Error: .env file not found at ${envPath}`);
    return null;
  }
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/PRINTIFY_API_TOKEN="(.+)"/);
  return match ? match[1] : null;
}

async function listShops() {
  const token = getEnvToken();
  if (!token) {
    console.log("Could not find PRINTIFY_API_TOKEN in .env");
    return;
  }

  console.log("Using token from .env (starts with: " + token.substring(0, 10) + "...)");

  try {
    const response = await fetch('https://api.printify.com/v1/shops.json', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const shops = await response.json();
      if (shops.length === 0) {
        console.log("No shops found for this token.");
      } else {
        console.log(`Found ${shops.length} shop(s):\n`);
        for (const shop of shops) {
          console.log(`-----------------------------------`);
          console.log(`SHOP NAME: ${shop.title}`);
          console.log(`SHOP ID:   ${shop.id}`);
          console.log(`CHANNEL:   ${shop.sales_channel || 'N/A'}`);
          
          // Fetch Webhooks
          try {
            const wRes = await fetch(`https://api.printify.com/v1/shops/${shop.id}/webhooks.json`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (wRes.ok) {
              const webhooks = await wRes.json();
              if (webhooks.length > 0) {
                console.log(`WEBHOOKS (${webhooks.length}):`);
                webhooks.forEach(w => console.log(` - [${w.topic}] -> ${w.url}`));
              } else {
                console.log("WEBHOOKS: None");
              }
            }
          } catch (e) {
            console.log("WEBHOOKS: Error fetching");
          }
        }
        console.log(`-----------------------------------`);
      }
    } else {
      const err = await response.text();
      console.log(`Failed to fetch shops. Status: ${response.status}`);
      console.log(`Response: ${err}`);
      if (response.status === 401) {
        console.log("\nTIP: Ensure you copied the FULL token from Printify and there are no extra characters in your .env file.");
      }
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

listShops();
