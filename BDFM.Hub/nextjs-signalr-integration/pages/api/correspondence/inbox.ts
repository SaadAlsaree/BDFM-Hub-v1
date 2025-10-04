import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // Extract authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header required' });
        }

        // Build query string from request query parameters
        const queryParams = new URLSearchParams();
        Object.entries(req.query).forEach(([key, value]) => {
            if (typeof value === 'string') {
                queryParams.append(key, value);
            } else if (Array.isArray(value)) {
                value.forEach(v => queryParams.append(key, v));
            }
        });

        // Forward request to BDFM API
        const apiUrl = `${process.env.API_URL}/BDFM/v1/api/Correspondence/GetUserInbox?${queryParams.toString()}`;

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('BDFM API Error:', response.status, errorText);
            return res.status(response.status).json({
                message: 'Failed to fetch inbox data',
                error: errorText
            });
        }

        const data = await response.json();

        // Return the data (maintaining the Response<PagedResult<InboxItemVm>> structure)
        res.status(200).json(data);
    } catch (error) {
        console.error('API Route Error:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 