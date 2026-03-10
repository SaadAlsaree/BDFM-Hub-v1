import { NextResponse } from 'next/server';
import { axiosInstance } from '@/lib/axios';
import { getProxyHeaders } from '@/lib/proxyHeaders';

// Helper to handle all proxy requests dynamically
async function handleProxyRequest(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 1. Get custom headers for proxying (Auth, Content-Type, Language, etc.)
    const proxyHeaders = await getProxyHeaders(request);

    // Reconstruct the requested API path
    const resolvedParams = await params;
    const pathParams = resolvedParams.path;
    const apiPath = '/' + pathParams.join('/');

    // Also get the query string
    const { search } = new URL(request.url);
    const fullApiPath = apiPath + search;

    // Get the method
    const method = request.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

    // Get body if it exists
    let body = undefined;
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        body = await request.json();
      } catch {
        // Body might be empty or not JSON
      }
    }

    // Special handling for SignalR Hubs (usually not under /api prefix)
    const isHubRequest = apiPath.includes('Hub') || apiPath.includes('negotiate');

    // Proxy the request using axiosInstance
    const apiResponse = await axiosInstance({
      url: fullApiPath,
      method,
      data: body,
      headers: proxyHeaders as any,
      // If it's a hub, use the root URL from API_URL by stripping the /BDFM/v1/api prefix
      ...(isHubRequest && process.env.API_URL ? { 
        baseURL: process.env.API_URL.replace(/\/BDFM\/v1\/api\/?$/, '') 
      } : {})
    });

    // The result is in apiResponse.data which follows IResponse structure
    return NextResponse.json(apiResponse.data, { status: apiResponse.status });
  } catch (error: any) {
    console.error('[GLOBAL_API_PROXY_ERROR]', error);
    
    // Check if it's an axios error with a response
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
