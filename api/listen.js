// Store submitted data in memory
let submittedData = null;

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
            const { entityName, dateOfBirth, country } = req.body;
            
            // Store the submitted data
            submittedData = {
                entityName,
                dateOfBirth,
                country,
                timestamp: new Date().toISOString()
            };

            // Simulate processing time
            await new Promise(resolve => setTimeout(resolve, 2000));

            res.status(200).json({ success: true, message: 'Data received successfully' });
        } catch (error) {
            console.error('Error processing POST request:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else if (req.method === 'GET') {
        try {
            if (!submittedData) {
                res.status(200).json({ success: true, data: [] });
                return;
            }

            // Simulate screening results from different sources
            const screeningResults = [
                {
                    html: `<h3>LLAMA3</h3><table border="1" cellpadding="5" cellspacing="0" style="margin-bottom: 20px; border-collapse: collapse; width: 100%;">
                        <tr><td><strong>entity_summary</strong></td><td>
                            <table border="1" cellpadding="5" cellspacing="0" style="margin: 10px 0 10px 10px; border-collapse: collapse;">
                                <tr><td><strong>name</strong></td><td>${submittedData.entityName}</td></tr>
                                <tr><td><strong>identifiers_used</strong></td><td>Full name</td></tr>
                                <tr><td><strong>search_date</strong></td><td>${new Date().toISOString().split('T')[0]}</td></tr>
                                <tr><td><strong>summary</strong></td><td>No adverse media mentions found.</td></tr>
                            </table>
                        </td></tr>
                        <tr><td><strong>risk_score</strong></td><td>0</td></tr>
                        <tr><td><strong>confidence_level</strong></td><td>100</td></tr>
                        <tr><td><strong>escalation_level</strong></td><td>Low</td></tr>
                    </table>`
                },
                {
                    html: `<h3>OpenAI</h3><table border="1" cellpadding="5" cellspacing="0" style="margin-bottom: 20px; border-collapse: collapse; width: 100%;">
                        <tr><td><strong>entity_summary</strong></td><td>
                            <table border="1" cellpadding="5" cellspacing="0" style="margin: 10px 0 10px 10px; border-collapse: collapse;">
                                <tr><td><strong>name</strong></td><td>${submittedData.entityName}</td></tr>
                                <tr><td><strong>identifiers_used</strong></td><td>Full name</td></tr>
                                <tr><td><strong>search_date</strong></td><td>${new Date().toISOString().split('T')[0]}</td></tr>
                                <tr><td><strong>summary</strong></td><td>No adverse media mentions found.</td></tr>
                            </table>
                        </td></tr>
                        <tr><td><strong>risk_score</strong></td><td>0</td></tr>
                        <tr><td><strong>confidence_level</strong></td><td>100</td></tr>
                        <tr><td><strong>escalation_level</strong></td><td>Low</td></tr>
                    </table>`
                },
                {
                    html: `<h3>DeepSeek</h3><table border="1" cellpadding="5" cellspacing="0" style="margin-bottom: 20px; border-collapse: collapse; width: 100%;">
                        <tr><td><strong>entity_summary</strong></td><td>
                            <table border="1" cellpadding="5" cellspacing="0" style="margin: 10px 0 10px 10px; border-collapse: collapse;">
                                <tr><td><strong>name</strong></td><td>${submittedData.entityName}</td></tr>
                                <tr><td><strong>identifiers_used</strong></td><td>Full name</td></tr>
                                <tr><td><strong>search_date</strong></td><td>${new Date().toISOString().split('T')[0]}</td></tr>
                                <tr><td><strong>summary</strong></td><td>No adverse media mentions found.</td></tr>
                            </table>
                        </td></tr>
                        <tr><td><strong>risk_score</strong></td><td>0</td></tr>
                        <tr><td><strong>confidence_level</strong></td><td>100</td></tr>
                        <tr><td><strong>escalation_level</strong></td><td>Low</td></tr>
                    </table>`
                }
            ];

            res.status(200).json({ success: true, data: screeningResults });
        } catch (error) {
            console.error('Error processing GET request:', error);
            res.status(500).json({ success: false, error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
} 