require('dotenv').config();
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for React frontend
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', '*'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HimVigil Express Backend',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Mount main API router
app.use('/api', apiRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Error handling middleware
app.use((err, req, res, _next) => {
  console.error('[Server Error]:', err.stack);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🌲 HimVigil Backend running on http://localhost:${PORT}`);
  console.log(`🏔️ API Endpoints:`);
  console.log(`   - GET  http://localhost:${PORT}/api/villages`);
  console.log(`   - GET  http://localhost:${PORT}/api/risk/:villageId`);
  console.log(`   - POST http://localhost:${PORT}/api/simulate`);
  console.log(`   - GET  http://localhost:${PORT}/api/alerts`);
  console.log(`   - GET  http://localhost:${PORT}/health`);
  console.log(`====================================================`);
});
