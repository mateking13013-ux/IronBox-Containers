/**
 * Test WordPress JWT Authentication
 * Run with: node test-wp-auth.mjs
 */

import fetch from 'node-fetch';

// Configuration - Update these with your WordPress credentials
const WP_GRAPHQL_URL = 'https://cms.ironboxcontainers.com/graphql';
const WP_USERNAME = 'your_username'; // UPDATE THIS
const WP_PASSWORD = 'your_password'; // UPDATE THIS

async function testJWTAuth() {
  console.log('🔐 Testing WordPress JWT Authentication...\n');

  // 1. Test Login
  console.log('1️⃣ Testing Login Mutation...');
  const loginQuery = `
    mutation LoginUser($username: String!, $password: String!) {
      login(input: {
        username: $username
        password: $password
      }) {
        authToken
        refreshToken
        user {
          id
          userId
          name
          email
        }
      }
    }
  `;

  try {
    const loginResponse = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: loginQuery,
        variables: {
          username: WP_USERNAME,
          password: WP_PASSWORD
        }
      })
    });

    const loginData = await loginResponse.json();

    if (loginData.errors) {
      console.error('❌ Login failed:', loginData.errors);
      return;
    }

    if (!loginData.data?.login) {
      console.error('❌ No login data returned');
      return;
    }

    const { authToken, refreshToken, user } = loginData.data.login;
    console.log('✅ Login successful!');
    console.log('   User:', user.name, `(${user.email})`);
    console.log('   Auth Token:', authToken.substring(0, 20) + '...');
    console.log('   Refresh Token:', refreshToken.substring(0, 20) + '...\n');

    // 2. Test authenticated request
    console.log('2️⃣ Testing Authenticated Request...');
    const meQuery = `
      query GetCurrentUser {
        viewer {
          id
          userId
          name
          email
          roles {
            nodes {
              name
            }
          }
        }
      }
    `;

    const meResponse = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({
        query: meQuery
      })
    });

    const meData = await meResponse.json();

    if (meData.errors) {
      console.error('❌ Authenticated request failed:', meData.errors);
      return;
    }

    if (meData.data?.viewer) {
      console.log('✅ Authenticated request successful!');
      console.log('   Current user:', meData.data.viewer.name);
      console.log('   Roles:', meData.data.viewer.roles.nodes.map(r => r.name).join(', '));
    } else {
      console.log('⚠️ No viewer data returned (might need to be logged in)');
    }

    // 3. Test token refresh
    console.log('\n3️⃣ Testing Token Refresh...');
    const refreshQuery = `
      mutation RefreshToken($refreshToken: String!) {
        refreshJwtAuthToken(input: {
          jwtRefreshToken: $refreshToken
        }) {
          authToken
        }
      }
    `;

    const refreshResponse = await fetch(WP_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: refreshQuery,
        variables: {
          refreshToken: refreshToken
        }
      })
    });

    const refreshData = await refreshResponse.json();

    if (refreshData.errors) {
      console.error('❌ Token refresh failed:', refreshData.errors);
      return;
    }

    if (refreshData.data?.refreshJwtAuthToken) {
      const newAuthToken = refreshData.data.refreshJwtAuthToken.authToken;
      console.log('✅ Token refresh successful!');
      console.log('   New auth token:', newAuthToken.substring(0, 20) + '...');
    }

    console.log('\n✨ All JWT authentication tests passed!');
    console.log('📝 Next steps:');
    console.log('   1. Update .env with WP_USERNAME and WP_PASSWORD');
    console.log('   2. Use wpAuth.ts functions in your Astro components');
    console.log('   3. Store tokens securely (cookies/localStorage) for persistence');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testJWTAuth();
