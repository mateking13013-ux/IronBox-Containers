import 'dotenv/config';

export const prerender = false;

export async function GET() {
    const WP_REST_URL = import.meta.env.WP_REST_URL || process.env.WP_REST_URL;
    const WC_CONSUMER_KEY = import.meta.env.WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
    const WC_CONSUMER_SECRET = import.meta.env.WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;

    if (!WP_REST_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
        return new Response(JSON.stringify({ message: 'Server configuration error' }), { status: 500 });
    }

    const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

    try {
        const response = await fetch(`${WP_REST_URL}/wc/v3/payment_gateways`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            return new Response(JSON.stringify({ message: 'Failed to fetch gateways' }), { status: response.status });
        }

        const gateways = await response.json();

        // Filter only enabled gateways
        const enabledGateways = gateways
            .filter(g => g.enabled)
            .map(g => ({
                id: g.id,
                title: g.title,
                description: g.description
            }));

        return new Response(JSON.stringify(enabledGateways), { status: 200 });

    } catch (error) {
        console.error('Gateway Fetch Error:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
