# Deployment Guide

## Akash Network Deployment

This guide covers deploying the Decentralized Polling App on Akash Network using the provided SDL configuration.

### Prerequisites

1. **Akash CLI**: Install the Akash CLI tool
2. **Wallet**: Set up an Akash wallet with sufficient AKT tokens
3. **Certificate**: Generate a deployment certificate

### Quick Deployment Steps

#### 1. Prepare Your Environment

```bash
# Install Akash CLI (if not already installed)
curl -sSfL https://raw.githubusercontent.com/akash-network/provider/main/install.sh | sh

# Create and fund your wallet
akash keys add my-wallet

# Create certificate
akash tx cert generate client --from my-wallet --chain-id akashnet-2
akash tx cert publish client --from my-wallet --chain-id akashnet-2
```

#### 2. Deploy to Akash

```bash
# Create deployment
akash tx deployment create deploy.txt --from my-wallet --chain-id akashnet-2

# Check deployment status
akash query deployment list --owner $(akash keys show my-wallet -a)

# View bids
akash query market bid list --owner $(akash keys show my-wallet -a)

# Accept a bid (replace with actual bid details)
akash tx market lease create --bid-id <bid-id> --from my-wallet --chain-id akashnet-2

# Check lease status
akash query market lease list --owner $(akash keys show my-wallet -a)

# Get service URLs
akash provider lease-status --from my-wallet --dseq <deployment-sequence>
```

#### 3. Access Your Application

Once deployed, you'll receive URLs for your services:
- **Frontend**: `https://your-random-url.akashian.io` (publicly accessible)
- **Backend**: Internal only, communicates with frontend
- **Database**: Internal only, communicates with backend

## Local Development Setup

### Backend Development

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Variables**
Create a `.env` file in the backend directory:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/hackodisha-poll
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
```

3. **Start MongoDB**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongo-dev mongo:6.0

# Or using local MongoDB installation
mongod
```

4. **Start Backend Server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Development

1. **Serve Frontend Files**
```bash
cd frontend

# Using Python
python -m http.server 8080

# Using Node.js
npx http-server -p 8080

# Using Live Server (VS Code extension)
# Right-click index.html -> "Open with Live Server"
```

2. **Development URLs**
- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:3000/api`
- Health Check: `http://localhost:3000/health`

## SDL Configuration Explained

### Service Architecture

The `deploy.txt` file defines a three-tier architecture:

```yaml
services:
  frontend:  # Public web interface (NGINX)
  backend:   # Private API server (Node.js)
  db:        # Private database (MongoDB)
```

### Resource Allocation

```yaml
profiles:
  compute:
    frontend:   # Lightweight: 0.1 CPU, 128Mi RAM
    backend:    # Medium: 0.2 CPU, 256Mi RAM  
    db:         # Medium: 0.2 CPU, 256Mi RAM + 1Gi persistent storage
```

### Security Configuration

- **Frontend**: Exposed globally (port 80)
- **Backend**: Only accessible from frontend service
- **Database**: Only accessible from backend service
- **Persistent Storage**: Database data survives container restarts

### Pricing Strategy

```yaml
pricing:
  frontend: 100 uakt  # ~$0.01/month
  backend:  120 uakt  # ~$0.012/month
  db:       150 uakt  # ~$0.015/month
```

**Total estimated cost**: ~$0.037/month (extremely affordable!)

## Troubleshooting

### Common Issues

#### 1. Deployment Fails
```bash
# Check deployment logs
akash provider lease-logs --from my-wallet --dseq <deployment-sequence>

# Common causes:
# - Insufficient AKT balance
# - Invalid SDL syntax
# - No available providers
```

#### 2. Services Can't Communicate
- Verify service names match in SDL
- Check internal networking configuration
- Ensure ports are correctly exposed

#### 3. Database Connection Issues
```bash
# Check MongoDB status in logs
akash provider lease-logs --from my-wallet --dseq <deployment-sequence> --service db

# Verify MONGO_URI environment variable
# Ensure database service is running before backend
```

#### 4. Frontend Can't Reach Backend
- Verify API_BASE_URL in frontend JavaScript
- Check CORS configuration in backend
- Ensure backend service is running

### Debugging Commands

```bash
# Get detailed deployment info
akash query deployment get --owner $(akash keys show my-wallet -a) --dseq <deployment-sequence>

# Check provider logs
akash provider lease-logs --from my-wallet --dseq <deployment-sequence>

# Shell into a running container
akash provider lease-shell --from my-wallet --dseq <deployment-sequence> --service backend
```

## Production Considerations

### Security Enhancements

1. **Environment Variables**: Store sensitive data in environment variables
2. **Rate Limiting**: Already implemented in backend
3. **Input Validation**: Already implemented with express-validator
4. **HTTPS**: Automatic with Akash ingress controller

### Monitoring

1. **Health Checks**: `/health` endpoint available
2. **Logging**: Use `akash provider lease-logs` for monitoring
3. **Metrics**: Consider adding application metrics

### Scaling

1. **Horizontal Scaling**: Increase `count` in deployment section
2. **Vertical Scaling**: Increase CPU/memory in compute profiles
3. **Database**: Consider MongoDB clustering for high availability

## Cost Optimization

### Tips for Reducing Costs

1. **Resource Tuning**: Start with minimal resources, scale up as needed
2. **Efficient Images**: Use Alpine Linux variants
3. **Smart Bidding**: Accept competitive bids from reliable providers
4. **Resource Monitoring**: Monitor actual usage vs allocated resources

### Example Monthly Costs

| Configuration | Estimated Cost/Month |
|---------------|---------------------|
| Development   | $0.037              |
| Production    | $0.074              |
| High Traffic  | $0.148              |

*Costs based on current AKT prices and may vary*

## Support and Resources

- **Akash Documentation**: https://docs.akash.network
- **Discord Community**: https://discord.akash.network
- **GitHub Issues**: Report bugs in this repository
- **Akash Forum**: https://forum.akash.network

## Next Steps

1. **Custom Domain**: Configure your own domain name
2. **SSL Certificates**: Set up custom SSL certificates
3. **Analytics**: Add usage tracking and analytics
4. **Authentication**: Implement user accounts and authentication
5. **Real-time Updates**: Add WebSocket support for live poll updates
