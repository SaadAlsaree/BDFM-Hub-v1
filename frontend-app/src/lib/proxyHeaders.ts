import { getServerSession } from 'next-auth';
import authOption from '@/lib/auth-option';

/**
 * Utility to extract specific headers from an incoming request
 * and add any necessary authentication headers for the backend proxy.
 */
export async function getProxyHeaders(request: Request): Promise<HeadersInit> {
  const session = await getServerSession(authOption);
  const headers = new Headers();

  // 1. Mandatory Header: Authorization (from NextAuth Session)
  if (session?.accessToken) {
    headers.set('Authorization', `Bearer ${session.accessToken}`);
  }

  // 1.5. Internal Proxy Key (Shared Secret with C# Backend)
  const proxyKey = process.env.INTERNAL_PROXY_KEY;
  if (proxyKey) {
    headers.set('X-Internal-Proxy-Key', proxyKey);
  }

  // 2. Mandatory Header: Content-Type (forwarded from request or default to JSON)
  const contentType = request.headers.get('Content-Type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  } else if (request.method !== 'GET' && request.method !== 'DELETE') {
    headers.set('Content-Type', 'application/json');
  }

  // 3. Optional Header: Accept-Language (forwarded for localization)
  const acceptLanguage = request.headers.get('Accept-Language');
  if (acceptLanguage) {
    headers.set('Accept-Language', acceptLanguage);
  }

  // 4. Optional Header: User-Agent (forwarded for logging/analytics in backend)
  const userAgent = request.headers.get('User-Agent');
  if (userAgent) {
    headers.set('User-Agent', userAgent);
  }

  // Convert to plain object for compatibility with fetch
  return Object.fromEntries(headers.entries());
}
