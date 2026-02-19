const express = require('express');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const multer = require('multer');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow most common file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/json'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}`));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// S3 Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file provided',
        message: 'Please upload a file using the "file" field'
      });
    }

    if (!process.env.S3_BUCKET_NAME) {
      return res.status(400).json({
        error: 'Configuration Error',
        message: 'S3_BUCKET_NAME environment variable is not set'
      });
    }

    const fileName = `uploads/${Date.now()}-${req.file.originalname}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: 'private' // Change to 'public-read' if you want public access
    };

    const data = await s3.upload(params).promise();

    res.status(200).json({
      message: 'File uploaded successfully to S3',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      s3Key: data.Key,
      s3Location: data.Location,
      bucket: process.env.S3_BUCKET_NAME,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('S3 Upload Error:', error);
    res.status(500).json({
      error: 'File upload failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Get upload status endpoint
app.get('/upload/status', (req, res) => {
  const configured = !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.S3_BUCKET_NAME
  );

  res.status(200).json({
    uploadEndpoint: '/upload',
    s3Configured: configured,
    bucket: process.env.S3_BUCKET_NAME || 'Not configured',
    region: process.env.AWS_REGION || 'us-east-1',
    maxFileSize: '10MB',
    supportedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/json'
    ]
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
