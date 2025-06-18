export default function handler(req, res) {
    if (req.method === 'POST') {
        const data = req.body;
        console.log("Received:", data);
        res.status(200).json({ success: true, message: "Data received successfully" });
    } else {
        res.status(405).json({ message: 'Method Not Allowed' });
    }
}