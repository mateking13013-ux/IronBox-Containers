import 'dotenv/config';

const WP_REST_URL = process.env.WP_REST_URL;
const WC_CONSUMER_KEY = process.env.WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET;

const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

async function checkGateways() {
  console.log('Checking Payment Gateways...');
  
  try {
    const response = await fetch(`${WP_REST_URL}/wc/v3/payment_gateways`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Error:', response.status, response.statusText);
      const text = await response.text();
      console.error('Body:', text);
      return;
    }

    const gateways = await response.json();
    
    console.log('\nEnabled Gateways:');
    gateways.filter(g => g.enabled).forEach(g => {
      console.log(`- ${g.title} (ID: ${g.id})`);
      console.log(`  Description: ${g.description}`);
    });

    console.log('\nDisabled Gateways:');
    gateways.filter(g => !g.enabled).forEach(g => {
      console.log(`- ${g.title} (ID: ${g.id})`);
    });

  } catch (error) {
    console.error('Failed:', error);
  }
}

checkGateways();
