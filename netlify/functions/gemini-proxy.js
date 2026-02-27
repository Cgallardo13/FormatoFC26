// Netlify Function for Gemini API Proxy
// This function securely calls Gemini API using environment variables
// Environment variable: GEMINI_API_KEY (configured in Netlify dashboard)

export const handler = async (event, context) => {
    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method not allowed. Use POST.' }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    // Get API key from environment variables
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Gemini API key not configured',
                message: 'Contact administrator to setup GEMINI_API_KEY in Netlify environment variables'
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    try {
        // Parse request body
        let requestBody;
        try {
            requestBody = JSON.parse(event.body);
        } catch (parseError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid JSON in request body' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        // Validate request structure
        if (!requestBody.contents || !Array.isArray(requestBody.contents)) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Invalid request format. Missing "contents" array.' }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        // Construct Gemini API URL
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

        console.log('🤖 Calling Gemini API via Netlify Function...');

        // Make request to Gemini API
        const response = await fetch(geminiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        const responseData = await response.json();

        // Log response status (without exposing full response for security)
        console.log(`✅ Gemini API responded: ${response.status}`);

        if (!response.ok) {
            console.error('❌ Gemini API error:', responseData);
            return {
                statusCode: response.status,
                body: JSON.stringify({
                    error: 'Gemini API request failed',
                    details: responseData.error || responseData
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        // Success - return Gemini response
        return {
            statusCode: 200,
            body: JSON.stringify(responseData),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (error) {
        console.error('❌ Netlify Function error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
};
