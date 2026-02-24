import { getSecret } from 'astro:env/server';

export const prerender = false;

export async function POST({ request }) {
    try {
        const data = await request.json();

        // Basic validation
        if (!data.billing || !data.line_items) {
            return new Response(JSON.stringify({ message: 'Missing required fields' }), { status: 400 });
        }

        // Get credentials from env
        const WP_REST_URL = import.meta.env.WP_REST_URL || process.env.WP_REST_URL;
        const WC_CONSUMER_KEY = import.meta.env.WC_CONSUMER_KEY || process.env.WC_CONSUMER_KEY;
        const WC_CONSUMER_SECRET = import.meta.env.WC_CONSUMER_SECRET || process.env.WC_CONSUMER_SECRET;

        if (!WP_REST_URL || !WC_CONSUMER_KEY || !WC_CONSUMER_SECRET) {
            console.error('Missing WP credentials');
            return new Response(JSON.stringify({ message: 'Server configuration error' }), { status: 500 });
        }

        const auth = Buffer.from(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`).toString('base64');

        // Construct WooCommerce Order Payload
        const orderData = {
            payment_method: data.payment_method || 'bacs',
            payment_method_title: data.payment_method === 'bacs' ? 'Direct Bank Transfer' : 'Online Payment', // Ideally fetch title from gateway list, but this is a safe fallback
            set_paid: false,
            billing: {
                first_name: data.billing.firstName,
                last_name: data.billing.lastName,
                address_1: data.billing.address1,
                address_2: data.billing.address2 || '',
                city: data.billing.city,
                state: data.billing.state,
                postcode: data.billing.postcode,
                country: 'US',
                email: data.billing.email,
                phone: data.billing.phone
            },
            shipping: {
                first_name: data.billing.firstName, // Assuming shipping = billing for simplicity, can be split
                last_name: data.billing.lastName,
                address_1: data.billing.address1,
                address_2: data.billing.address2 || '',
                city: data.billing.city,
                state: data.billing.state,
                postcode: data.billing.postcode,
                country: 'US'
            },
            line_items: data.line_items.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            })),
            shipping_lines: [
                {
                    method_id: 'flat_rate',
                    method_title: 'Flat Rate Shipping',
                    total: '300.00' // Hardcoded for now based on policy, should be dynamic
                }
            ]
        };

        // Send to WooCommerce
        const response = await fetch(`${WP_REST_URL}/wc/v3/orders`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const responseData = await response.json();

        if (!response.ok) {
            console.error('WooCommerce Error:', responseData);
            return new Response(JSON.stringify({
                message: responseData.message || 'Failed to create order',
                details: responseData
            }), { status: response.status });
        }

        return new Response(JSON.stringify({
            success: true,
            orderId: responseData.id,
            orderKey: responseData.order_key,
            total: responseData.total
        }), { status: 200 });

    } catch (error) {
        console.error('Checkout API Error:', error);
        return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
    }
}
