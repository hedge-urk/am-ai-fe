import { IncomingForm } from 'formidable';

// Store received data in memory
let receivedData = null;

export const config = {
    api: {
        bodyParser: false
    }
};

const parseForm = async (req) => {
    return new Promise((resolve, reject) => {
        const form = new IncomingForm();
        form.parse(req, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
};

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
            const { fields } = await parseForm(req);
            const htmlContent = fields.html || '';

            // Store the received data
            receivedData = {
                html: htmlContent,
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

            res.status(200).json({ success: true, data: receivedData });
        } catch (error) {
            console.error('Error processing GET request:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
} 