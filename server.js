const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'AWS EC2 Node.js Test Server',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime()
  });
});

app.get('/info', (req, res) => {
  res.status(200).json({
    app: 'AWS EC2 Test App',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: require('os').hostname()
  });
});

app.post('/test', (req, res) => {
  res.status(200).json({
    message: 'Test POST request received',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✓ Server is running on http://0.0.0.0:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ PID: ${process.pid}`);
});
