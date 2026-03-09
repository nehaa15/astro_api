// ═══════════════════════════════════════════════════════════════════════════
// ASTROLOGY & NUMEROLOGY API SERVER
// Node.js + Express Backend
// ═══════════════════════════════════════════════════════════════════════════

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import services
const { generateKundali } = require('./services/kundali');
const { generateNumerology } = require('./services/numerology');
const { generatePredictions } = require('./services/predictions');

const app = express();
const PORT = process.env.PORT || 4000;

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════

// CORS - Allow frontend requests
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'x-api-key']
}));

// JSON body parser
app.use(bodyParser.json());

// Request logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ═══════════════════════════════════════════════════════════════════════════
// API KEY AUTHENTICATION
// ═══════════════════════════════════════════════════════════════════════════

// API key for authentication (in production, use environment variable)
const API_KEY = process.env.API_KEY || 'astro-api-key-2024';

function authenticateApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({
            success: false,
            error: 'Missing API key. Include x-api-key header.'
        });
    }
    
    if (apiKey !== API_KEY) {
        return res.status(403).json({
            success: false,
            error: 'Invalid API key.'
        });
    }
    
    next();
}

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES
// ═══════════════════════════════════════════════════════════════════════════

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString()
    });
});

// Landing page
app.get("/", (req, res) => {
    res.send(`
    <h1>Astrology & Numerology API</h1>

    <p><strong>Status:</strong> Running</p>

    <h2>Available Endpoints</h2>

    <ul>
        <li><b>POST /generate-report</b> – Full astrology + numerology report</li>
        <li><b>POST /kundali</b> – Generate Kundali (birth chart)</li>
        <li><b>POST /numerology</b> – Generate numerology analysis</li>
        <li><b>GET /health</b> – Health check</li>
        <li><b>GET /api</b> – API information</li>
    </ul>

    <h2>Example Request</h2>

    <pre>
POST /generate-report

Headers:
x-api-key: astro-api-key-2024

Body:
{
  "name": "Rahul",
  "dob": "1996-05-10",
  "time": "14:30",
  "place": "Delhi"
}
    </pre>

    <p>API running successfully</p>
    `);
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        name: 'Astrology & Numerology API',
        version: '1.0.0',
        endpoints: {
            'POST /generate-report': 'Generate complete astrological report',
            'POST /kundali': 'Generate Kundali (birth chart) only',
            'POST /numerology': 'Generate numerology analysis only',
            'GET /health': 'Health check',
        }
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN API ENDPOINT - Generate Complete Report
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /generate-report
 * 
 * Generate complete astrological and numerological report
 * 
 * Request Body:
 * {
 *   "name": "John Doe",
 *   "dob": "1990-05-15",    // YYYY-MM-DD format
 *   "time": "14:30",         // HH:MM format (24-hour)
 *   "place": "Mumbai"        // City name
 * }
 * 
 * Headers:
 *   x-api-key: your-api-key
 */
app.post('/generate-report', authenticateApiKey, (req, res) => {
    try {
        const { name, dob, time, place } = req.body;
        
        // Validate required fields
        if (!name || !dob || !time || !place) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['name', 'dob', 'time', 'place'],
                received: { name: !!name, dob: !!dob, time: !!time, place: !!place }
            });
        }
        
        // Validate date format (YYYY-MM-DD)
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(dob)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid date format. Use YYYY-MM-DD (e.g., 1990-05-15)'
            });
        }
        
        // Validate time format (HH:MM)
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(time)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid time format. Use HH:MM (e.g., 14:30)'
            });
        }
        
        console.log(`Generating report for: ${name}, DOB: ${dob}, Time: ${time}, Place: ${place}`);
        
        // Generate Kundali (birth chart)
        const kundaliData = generateKundali(dob, time, place);
        
        // Generate Numerology analysis
        const numerologyData = generateNumerology(name, dob);
        
        // Generate Predictions
        const predictions = generatePredictions(name, dob, time, place, kundaliData, numerologyData);
        
        // Return complete report
        res.json({
            success: true,
            report: {
                name,
                dob,
                time,
                place,
                kundali: kundaliData,
                numerology: numerologyData,
                predictions
            }
        });
        
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// INDIVIDUAL ENDPOINTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * POST /kundali
 * Generate only the Kundali (birth chart)
 */
app.post('/kundali', authenticateApiKey, (req, res) => {
    try {
        const { dob, time, place } = req.body;
        
        if (!dob || !time || !place) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['dob', 'time', 'place']
            });
        }
        
        const kundaliData = generateKundali(dob, time, place);
        
        res.json({
            success: true,
            kundali: kundaliData
        });
        
    } catch (error) {
        console.error('Error generating kundali:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /numerology
 * Generate only the numerology analysis
 */
app.post('/numerology', authenticateApiKey, (req, res) => {
    try {
        const { name, dob } = req.body;
        
        if (!name || !dob) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields',
                required: ['name', 'dob']
            });
        }
        
        const numerologyData = generateNumerology(name, dob);
        
        res.json({
            success: true,
            numerology: numerologyData
        });
        
    } catch (error) {
        console.error('Error generating numerology:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// ═══════════════════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════════════════

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        availableEndpoints: ['/generate-report', '/kundali', '/numerology', '/health', '/api']
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// ═══════════════════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════════════════

app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║    ASTROLOGY & NUMEROLOGY API SERVER                       ║
╠════════════════════════════════════════════════════════════╣
║    Server running on: http://localhost:${PORT}               ║
║    API Key: ${API_KEY}                          ║
╠════════════════════════════════════════════════════════════╣
║    Endpoints:                                              ║
║    POST /generate-report - Full astrological report        ║
║    POST /kundali         - Birth chart only                ║
║    POST /numerology      - Numerology only                 ║
║    GET  /health          - Health check                    ║
║    GET  /api             - API info                        ║
╚════════════════════════════════════════════════════════════╝
    `);
});

module.exports = app;
