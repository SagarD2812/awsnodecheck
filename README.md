# AWS EC2 Node.js Test Application

A simple Node.js Express application designed for testing and deployment on AWS EC2 instances.

## Features

- Express.js server
- Health check endpoint
- Test endpoints for GET and POST requests
- Environment variable configuration
- Error handling middleware
- Development and production configurations

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone or extract the project
2. Install dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the root directory:

```
NODE_ENV=development
PORT=3000
```

## Running the Application

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### 1. **Health Check**
```
GET /health
```
Returns server health status and uptime.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 123.456
}
```

### 2. **Root Endpoint**
```
GET /
```
Returns application status and information.

**Response:**
```json
{
  "message": "AWS EC2 Node.js Test Server",
  "status": "running",
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

### 3. **Info Endpoint**
```
GET /info
```
Returns application and server information.

**Response:**
```json
{
  "app": "AWS EC2 Test App",
  "version": "1.0.0",
  "environment": "development",
  "hostname": "ip-172-31-0-1"
}
```

### 4. **Test POST Endpoint**
```
POST /test
```
Accepts JSON data and returns it with timestamp.

**Request Body:**
```json
{
  "testData": "your data"
}
```

**Response:**
```json
{
  "message": "Test POST request received",
  "body": {
    "testData": "your data"
  },
  "timestamp": "2026-02-19T10:30:00.000Z"
}
```

## Deployment on AWS EC2

### 1. Connect to Your EC2 Instance

```bash
ssh -i your-key.pem ec2-user@your-ec2-ip
```

### 2. Install Node.js

```bash
curl -sL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 3. Clone/Transfer Your Project

```bash
git clone your-repo-url
# or use scp/rsync to transfer files
```

### 4. Install Dependencies

```bash
cd aws_test
npm install --production
```

### 5. Run the Application

```bash
npm start
```

Or use PM2 for production:

```bash
npm install -g pm2
pm2 start server.js --name "aws-test-app"
pm2 startup
pm2 save
```

### 6. Configure Security Group

Allow inbound traffic on port 3000 (or your configured PORT):
- Protocol: TCP
- Port Range: 3000
- Source: 0.0.0.0/0 (or your IP)

### 7. Test the Application

```bash
curl http://your-ec2-ip:3000
curl http://your-ec2-ip:3000/health
curl http://your-ec2-ip:3000/info
```

## Testing

Use curl, Postman, or any HTTP client to test the endpoints:

```bash
# Test GET
curl http://localhost:3000/

# Test health check
curl http://localhost:3000/health

# Test POST
curl -X POST http://localhost:3000/test \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello from EC2"}'
```

## Environment Variables

- `NODE_ENV` - Application environment (development/production)
- `PORT` - Server port (default: 3000)

## License

ISC

## Notes

- The application listens on `0.0.0.0` to accept connections from anywhere
- Make sure your EC2 security group allows inbound traffic on the configured port
- For production, consider using Nginx as a reverse proxy
- Use PM2 or similar process manager for production deployments
