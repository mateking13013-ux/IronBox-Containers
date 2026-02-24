/**
 * WordPress JWT Authentication utilities
 */

import { wpGraphQLFetch } from './wpClient';

interface LoginResponse {
  login: {
    authToken: string;
    refreshToken: string;
    user: {
      id: string;
      userId: number;
      name: string;
      email: string;
    };
  };
}

interface RefreshTokenResponse {
  refreshJwtAuthToken: {
    authToken: string;
  };
}

interface AuthTokens {
  authToken: string;
  refreshToken: string;
  expiresAt: number;
}

let currentTokens: AuthTokens | null = null;

/**
 * Login to WordPress and get JWT tokens
 */
export async function wpLogin(username: string, password: string): Promise<AuthTokens> {
  const query = `
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
    const response = await wpGraphQLFetch<LoginResponse>({
      query,
      variables: { username, password }
    });

    const { authToken, refreshToken } = response.login;

    // Store tokens with expiration (5 minutes for auth token as configured)
    const tokens: AuthTokens = {
      authToken,
      refreshToken,
      expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
    };

    currentTokens = tokens;
    return tokens;
  } catch (error) {
    console.error('Login failed:', error);
    throw new Error('Authentication failed. Please check your credentials.');
  }
}

/**
 * Refresh the auth token using refresh token
 */
export async function refreshAuthToken(refreshToken: string): Promise<string> {
  const query = `
    mutation RefreshAuthToken($refreshToken: String!) {
      refreshJwtAuthToken(input: {
        jwtRefreshToken: $refreshToken
      }) {
        authToken
      }
    }
  `;

  try {
    const response = await wpGraphQLFetch<RefreshTokenResponse>({
      query,
      variables: { refreshToken }
    });

    const newAuthToken = response.refreshJwtAuthToken.authToken;

    // Update stored tokens
    if (currentTokens) {
      currentTokens.authToken = newAuthToken;
      currentTokens.expiresAt = Date.now() + (5 * 60 * 1000);
    }

    return newAuthToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw new Error('Failed to refresh authentication token.');
  }
}

/**
 * Get current valid auth token (refreshes if expired)
 */
export async function getValidAuthToken(): Promise<string | null> {
  if (!currentTokens) {
    return null;
  }

  // Check if token is expired or about to expire (30 seconds buffer)
  if (Date.now() >= currentTokens.expiresAt - 30000) {
    try {
      const newToken = await refreshAuthToken(currentTokens.refreshToken);
      return newToken;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      currentTokens = null;
      return null;
    }
  }

  return currentTokens.authToken;
}

/**
 * Logout and clear tokens
 */
export function wpLogout(): void {
  currentTokens = null;
}

/**
 * Check if user is logged in
 */
export function isAuthenticated(): boolean {
  return currentTokens !== null;
}

/**
 * Get current tokens (for debugging/storage)
 */
export function getCurrentTokens(): AuthTokens | null {
  return currentTokens;
}

/**
 * Set tokens (for restoring from storage)
 */
export function setTokens(tokens: AuthTokens): void {
  currentTokens = tokens;
}
