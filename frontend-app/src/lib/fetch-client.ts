// lib/fetch-client.ts
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

/**
 * Base fetch client for making HTTP requests
 * @param url The URL to make the request to
 * @param options Request options
 * @returns Response data
 */
export async function fetchClient(url: string, options: RequestInit = {}) {
  // Try to get the session token if we're in a browser environment
  let authHeader = {};
  if (typeof window !== 'undefined') {
    try {
      const session = await getSession();
      if (session?.accessToken) {
        authHeader = {
          Authorization: `Bearer ${session.accessToken}`
        };
      }
    } catch (error) {
      console.error('Error getting session:', error);
    }
  }

  // Set default headers if not provided
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...options.headers
  };

  // Prepare full URL (handle relative vs absolute URLs)
  const fullUrl = url.startsWith('http') ? url : `${API_URL}${url}`;

  // Make the request
  const response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include' // Include cookies in requests
  });

  // Handle response
  if (!response.ok) {
    throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
  }

  // Check for JSON content and parse if present
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
}

/**
 * Auth-related fetch methods
 */
export const fetchAuth = {
  get: async (url: string, options: RequestInit = {}) => {
    return fetchClient(url, { ...options, method: 'GET' });
  },

  post: async <T = Record<string, unknown>>(
    url: string,
    data: T,
    options: RequestInit = {}
  ) => {
    return fetchClient(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
};

export default fetchClient;
