/**
 * Shared utilities for communicating with the WordPress + WooCommerce backend.
 */

export type GraphQLRequest<TVariables extends Record<string, unknown> = Record<string, never>> = {
  query: string;
  variables?: TVariables;
};

export interface GraphQLFetchOptions extends RequestInit {
  headers?: Record<string, string> | Headers;
}

export interface RestFetchOptions extends RequestInit {
  headers?: Record<string, string> | Headers;
}

type EnvKey =
  | 'WP_GRAPHQL_URL'
  | 'WP_REST_URL'
  | 'WC_STORE_API_URL'
  | 'WC_CONSUMER_KEY'
  | 'WC_CONSUMER_SECRET'
  | 'WP_GRAPHQL_USER'
  | 'WP_GRAPHQL_PASSWORD';

const env: Partial<Record<EnvKey, string | undefined>> = {
  WP_GRAPHQL_URL: import.meta.env.WP_GRAPHQL_URL,
  WP_REST_URL: import.meta.env.WP_REST_URL,
  WC_STORE_API_URL: import.meta.env.WC_STORE_API_URL,
  WC_CONSUMER_KEY: import.meta.env.WC_CONSUMER_KEY,
  WC_CONSUMER_SECRET: import.meta.env.WC_CONSUMER_SECRET,
  WP_GRAPHQL_USER: import.meta.env.WP_GRAPHQL_USER,
  WP_GRAPHQL_PASSWORD: import.meta.env.WP_GRAPHQL_PASSWORD,
};

function assertEnv(key: EnvKey, required = true): string | undefined {
  const value = env[key]?.trim();
  if (required && !value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

function sanitizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '');
}

function toBase64(value: string): string {
  if (typeof btoa === 'function') {
    return btoa(value);
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(value, 'utf8').toString('base64');
  }
  throw new Error('Base64 encoding is not available in this environment.');
}

function normaliseHeaders(headers?: RestFetchOptions['headers']): Headers {
  if (!headers) return new Headers();
  return headers instanceof Headers ? headers : new Headers(headers);
}

/**
 * Perform a GraphQL request against the WordPress endpoint.
 */
export async function wpGraphQLFetch<TResponse, TVariables extends Record<string, unknown> = Record<string, never>>(
  request: GraphQLRequest<TVariables>,
  options: GraphQLFetchOptions = {},
): Promise<TResponse> {
  const graphqlUrl = sanitizeBaseUrl(assertEnv('WP_GRAPHQL_URL'));
  const headers = normaliseHeaders(options.headers);

  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');

  const username = assertEnv('WP_GRAPHQL_USER', false);
  const password = assertEnv('WP_GRAPHQL_PASSWORD', false);
  if (username && password && !headers.has('Authorization')) {
    headers.set('Authorization', `Basic ${toBase64(`${username}:${password}`)}`);
  }

  const response = await fetch(graphqlUrl, {
    method: 'POST',
    ...options,
    headers,
    body: JSON.stringify({
      query: request.query,
      variables: request.variables ?? {},
    }),
  });

  if (!response.ok) {
    const body = await safeReadBody(response);
    throw new Error(`WPGraphQL request failed (${response.status}): ${body}`);
  }

  const payload = (await response.json()) as { data?: TResponse; errors?: unknown };
  if (payload.errors) {
    throw new Error(`WPGraphQL responded with errors: ${JSON.stringify(payload.errors)}`);
  }

  if (!payload.data) {
    throw new Error('WPGraphQL responded without data.');
  }

  return payload.data;
}

/**
 * Perform a REST request against the generic WordPress API (`/wp-json`).
 */
export async function wpRestFetch<TResponse = unknown>(path: string, options: RestFetchOptions = {}): Promise<TResponse> {
  const baseUrl = sanitizeBaseUrl(assertEnv('WP_REST_URL'));
  const url = new URL(path.replace(/^\//, ''), `${baseUrl}/`).toString();
  const headers = normaliseHeaders(options.headers);

  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await safeReadBody(response);
    throw new Error(`WP REST request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

/**
 * Perform a REST request against the WooCommerce Store API.
 */
export async function wooStoreFetch<TResponse = unknown>(path: string, options: RestFetchOptions = {}): Promise<TResponse> {
  const baseUrl = sanitizeBaseUrl(assertEnv('WC_STORE_API_URL'));
  const url = new URL(path.replace(/^\//, ''), `${baseUrl}/`).toString();
  const headers = normaliseHeaders(options.headers);

  headers.set('Accept', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await safeReadBody(response);
    throw new Error(`WooCommerce Store API request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

/**
 * Perform a REST request against the WooCommerce legacy API (requires consumer key/secret).
 */
export async function wooAdminFetch<TResponse = unknown>(path: string, options: RestFetchOptions = {}): Promise<TResponse> {
  const baseUrl = sanitizeBaseUrl(assertEnv('WP_REST_URL'));
  const key = assertEnv('WC_CONSUMER_KEY');
  const secret = assertEnv('WC_CONSUMER_SECRET');
  const url = new URL(path.replace(/^\//, ''), `${baseUrl}/`).toString();
  const headers = normaliseHeaders(options.headers);

  headers.set('Accept', 'application/json');

  if (!headers.has('Authorization')) {
    headers.set('Authorization', `Basic ${toBase64(`${key}:${secret}`)}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await safeReadBody(response);
    throw new Error(`WooCommerce REST request failed (${response.status}): ${body}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  return (await response.json()) as TResponse;
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch (error) {
    console.error('Failed to read response body', error);
    return '<unreadable response body>';
  }
}
