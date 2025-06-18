// Store received data in memory
let receivedData = null;

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method === 'POST') {
        try {
            // Store the received data
            receivedData = {
                ...req.body,
                timestamp: new Date().toISOString()
            };

            console.log('Received data:', receivedData);
            res.status(200).json({ success: true, message: 'Data received successfully' });
        } catch (error) {
            console.error('Error processing POST request:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else if (req.method === 'GET') {
        try {
            if (!receivedData) {
                res.status(200).json({ success: true, data: null });
                return;
            }

            // Send the data and then clear it
            const dataToSend = receivedData;
            receivedData = null;
            res.status(200).json({ success: true, data: dataToSend });
        } catch (error) {
            console.error('Error processing GET request:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
} 