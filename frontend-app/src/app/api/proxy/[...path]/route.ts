import { NextResponse } from 'next/server';
import { axiosInstance } from '@/lib/axios';
import { getProxyHeaders } from '@/lib/proxyHeaders';
import { getServerSession } from 'next-auth';
import authOption from '@/lib/auth-option';

// Helper to handle all proxy requests dynamically
async function handleProxyRequest(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // Reconstruct the requested API path
    const resolvedParams = await params;
    const pathParams = resolvedParams.path;
    const apiPath = '/' + pathParams.join('/');

    // Also get the query string
    const { search } = new URL(request.url);
    const fullApiPath = apiPath + search;

    // Get the method
    const method = request.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    // Check if the request is multipart/form-data (file upload)
    const contentType = request.headers.get('Content-Type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    // Special handling for SignalR Hubs
    const isHubRequest = apiPath.includes('Hub') || apiPath.includes('negotiate');

    // --- Handle multipart/form-data requests (file uploads) ---
    if (isMultipart && method !== 'GET' && method !== 'DELETE') {
      return await handleMultipartProxy(request, fullApiPath, method, isHubRequest);
    }

    // --- Handle regular JSON requests ---
    const proxyHeaders = await getProxyHeaders(request);

    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json();
      } catch {
        // Body might be empty or not JSON
      }
    }

    const apiResponse = await axiosInstance({
      url: fullApiPath,
      method,
      data: body,
      headers: proxyHeaders as any,
      responseType: 'arraybuffer', // Get raw data to avoid corruption of binary files
      ...(isHubRequest && process.env.API_URL ? { 
        baseURL: process.env.API_URL.replace(/\/BDFM\/v1\/api\/?$/, '') 
      } : {})
    });

    // Check if the response is JSON or something else (like biological/binary)
    const responseContentType = apiResponse.headers['content-type'] || 'application/json';
    
    // If we have data, return it with the correct content type
    // Ensure we handle both binary data (Buffer/ArrayBuffer) and fallback POJOs from axios interceptors
    let responseBody: any = apiResponse.data;
    if (responseBody && typeof responseBody === 'object' && !(responseBody instanceof Buffer) && !(responseBody instanceof ArrayBuffer)) {
      responseBody = JSON.stringify(responseBody);
    }

    return new NextResponse(responseBody, { 
      status: apiResponse.status,
      headers: {
        'Content-Type': responseContentType,
        ...(apiResponse.headers['content-disposition'] && { 
          'Content-Disposition': apiResponse.headers['content-disposition'] 
        })
      }
    });
  } catch (error: any) {
    console.error('[GLOBAL_API_PROXY_ERROR]', error?.message || error);
    
    if (error.response) {
      return NextResponse.json(error.response.data, { 
        status: error.response.status 
      });
    }

    return NextResponse.json({
      succeeded: false,
      message: 'Internal server error during proxy request',
      errors: [error.message],
      code: '500'
    }, { status: 500 });
  }
}

// Handle multipart/form-data by forwarding the raw body using native fetch
async function handleMultipartProxy(
  request: Request,
  fullApiPath: string,
  method: string,
  isHubRequest: boolean
) {
  try {
    const session = await getServerSession(authOption);

    // Build the backend URL
    let baseURL = process.env.API_URL || 'http://cm-back.inss.local/BDFM/v1/api';
    if (isHubRequest) {
      baseURL = baseURL.replace(/\/BDFM\/v1\/api\/?$/, '');
    }
    const targetUrl = `${baseURL}${fullApiPath}`;

    // Build headers - forward Content-Type as-is (includes boundary)
    const headers: Record<string, string> = {};
    
    const originalContentType = request.headers.get('Content-Type');
    if (originalContentType) {
      headers['Content-Type'] = originalContentType;
    }

    if (session?.accessToken) {
      headers['Authorization'] = `Bearer ${session.accessToken}`;
    }

    const proxyKey = process.env.INTERNAL_PROXY_KEY;
    if (proxyKey) {
      headers['X-Internal-Proxy-Key'] = proxyKey;
    }

    // Read the raw body as ArrayBuffer and forward it
    const rawBody = await request.arrayBuffer();

    const response = await fetch(targetUrl, {
      method,
      headers,
      body: rawBody,
    });

    const responseData = await response.json();
    return NextResponse.json(responseData, { status: response.status });
  } catch (error: any) {
    console.error('[MULTIPART_PROXY_ERROR]', error?.message || error);

    if (error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    return NextResponse.json({
      succeeded: false,
      message: 'Failed to proxy file upload',
      errors: [error.message],
      code: '500'
    }, { status: 500 });
  }
}

// Export mapping for all supported HTTP methods
export async function GET(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, context);
}

export async function POST(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, context);
}

export async function PUT(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, context);
}

export async function DELETE(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, context);
}

export async function PATCH(request: Request, context: { params: Promise<{ path: string[] }> }) {
  return handleProxyRequest(request, context);
}
