import { IncomingForm } from 'formidable';

// Store received data in memory with ID-based keys
const dataStore = new Map();

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
    const { id } = req.query;
    
    if (!id) {
        return res.status(400).json({ success: false, error: 'ID parameter is required' });
    }

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

            // Store the received data with the specific ID
            dataStore.set(id, {
                html: htmlContent,
                timestamp: new Date().toISOString()
            });

            console.log(`Received data for ID ${id}:`, dataStore.get(id));
            res.status(200).json({ success: true, message: 'Data received successfully', id });
        } catch (error) {
            console.error('Error processing POST request:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else if (req.method === 'GET') {
        try {
            const receivedData = dataStore.get(id);
            if (!receivedData) {
                res.status(200).json({ success: true, data: null, id });
                return;
            }

            res.status(200).json({ success: true, data: receivedData, id });
        } catch (error) {
            console.error('Error processing GET request:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else if (req.method === 'DELETE') {
        dataStore.delete(id);
        res.status(200).json({ success: true, message: 'Data cleared', id });
    } else {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 