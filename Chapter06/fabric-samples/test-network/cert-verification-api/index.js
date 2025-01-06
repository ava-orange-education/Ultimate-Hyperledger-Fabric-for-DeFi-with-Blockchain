const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Dummy database (replace with your actual database)
const certificatesDB = {
    'hash1': { valid: true },
    'hash2': { valid: false },
    // Add more certificate hashes as needed
};

// Sample endpoint for certificate verification
app.post('/verify-certificate', (req, res) => {
    const { certificateHash } = req.body;

    if (!certificateHash) {
        return res.status(400).json({ error: 'Certificate hash is required' });
    }

    // Verification logic
    const certificate = certificatesDB[certificateHash];

    if (certificate && certificate.valid) {
        res.status(200).json({ message: 'Certificate is valid' });
    } else {
        res.status(404).json({ message: 'Certificate not found or invalid' });
    }
});

app.listen(port, () => {
    console.log(`Certificate verification API listening at http://localhost:${port}`);
});
