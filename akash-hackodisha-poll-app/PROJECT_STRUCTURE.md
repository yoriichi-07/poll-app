# Project Structure

## Overview
This document outlines the complete structure of the Akash Hackodisha Polling App, including all files, directories, and their purposes.

```
akash-hackodisha-poll-app/
│
├── README.md                 # Main project documentation
├── LICENSE                   # MIT License
├── deploy.txt               # Akash SDL configuration file
├── PROJECT_STRUCTURE.md     # This file
│
├── frontend/                # Frontend application
│   ├── index.html          # Main HTML page
│   ├── styles.css          # CSS styling
│   └── app.js              # JavaScript application logic
│
├── backend/                 # Backend API server
│   ├── package.json        # Node.js dependencies and scripts
│   └── server.js           # Express.js API server
│
└── docs/                    # Documentation
    ├── API.md              # API documentation
    └── DEPLOYMENT.md       # Deployment guide
```

## File Descriptions

### Root Directory

#### `README.md`
- **Purpose**: Main project documentation and overview
- **Content**: Project description, architecture, features, and quick start guide
- **Audience**: Developers, hackathon judges, users

#### `LICENSE`
- **Purpose**: Legal license for the project
- **Content**: MIT License terms
- **Importance**: Allows open-source usage and contribution

#### `deploy.txt`
- **Purpose**: Akash Network Stack Definition Language (SDL) configuration
- **Content**: Multi-service deployment definition with security and resource allocation
- **Usage**: Submit this file to Akash for deployment
- **Key Features**:
  - 3-tier architecture (frontend, backend, database)
  - Secure internal networking
  - Persistent storage for database
  - Cost-optimized resource allocation

#### `PROJECT_STRUCTURE.md`
- **Purpose**: Detailed project structure documentation
- **Content**: File organization and architectural decisions
- **Audience**: Developers and contributors

### Frontend Directory (`/frontend/`)

#### `index.html`
- **Purpose**: Main user interface
- **Technology**: HTML5 with semantic markup
- **Features**:
  - Responsive design
  - Poll creation form
  - Poll display and voting interface
  - Clean, modern UI

#### `styles.css`
- **Purpose**: User interface styling
- **Technology**: Modern CSS with Flexbox/Grid
- **Features**:
  - Responsive design for mobile/desktop
  - Gradient backgrounds and modern aesthetics
  - Smooth animations and transitions
  - Professional color scheme

#### `app.js`
- **Purpose**: Frontend application logic
- **Technology**: Vanilla JavaScript (ES6+)
- **Features**:
  - API communication with backend
  - Real-time poll updates
  - Form validation and user feedback
  - Responsive UI interactions
  - Error handling and loading states

### Backend Directory (`/backend/`)

#### `package.json`
- **Purpose**: Node.js project configuration
- **Content**: Dependencies, scripts, metadata
- **Key Dependencies**:
  - `express`: Web framework
  - `mongoose`: MongoDB ODM
  - `cors`: Cross-origin resource sharing
  - `helmet`: Security middleware
  - `express-rate-limit`: Rate limiting
  - `express-validator`: Input validation

#### `server.js`
- **Purpose**: Backend API server
- **Technology**: Node.js with Express framework
- **Features**:
  - RESTful API endpoints
  - MongoDB integration
  - Security middleware
  - Input validation
  - Error handling
  - Rate limiting
  - CORS configuration

### Documentation Directory (`/docs/`)

#### `API.md`
- **Purpose**: Complete API documentation
- **Content**: Endpoint descriptions, request/response formats, error codes
- **Audience**: Frontend developers, API consumers
- **Includes**: Authentication, rate limiting, data models

#### `DEPLOYMENT.md`
- **Purpose**: Comprehensive deployment guide
- **Content**: Akash deployment steps, local development setup, troubleshooting
- **Audience**: DevOps engineers, developers
- **Includes**: Cost estimates, security considerations, scaling advice

## Architecture Decisions

### 1. Technology Stack

**Frontend**: Vanilla HTML/CSS/JavaScript
- **Rationale**: Lightweight, no build process needed, easy to deploy
- **Benefits**: Fast loading, minimal dependencies, simple deployment

**Backend**: Node.js + Express + MongoDB
- **Rationale**: JavaScript full-stack, rapid development, JSON-native
- **Benefits**: Unified language, fast prototyping, scalable

**Database**: MongoDB
- **Rationale**: Document-based, easy schema evolution, JSON-native
- **Benefits**: Flexible data structure, horizontal scaling, cloud-ready

### 2. Deployment Strategy

**Container Images**: Official, lightweight images
- `nginx:1.25` for frontend
- `node:18-alpine` for backend  
- `mongo:6.0` for database

**Security**: Defense in depth
- Only frontend exposed publicly
- Backend accessible only from frontend
- Database accessible only from backend
- Input validation and rate limiting

### 3. Resource Allocation

**Frontend**: Minimal resources (static content)
- 0.1 CPU, 128Mi RAM, 128Mi storage

**Backend**: Moderate resources (API processing)
- 0.2 CPU, 256Mi RAM, 256Mi storage

**Database**: Moderate resources + persistent storage
- 0.2 CPU, 256Mi RAM, 1Gi persistent storage

### 4. Cost Optimization

**Strategy**: Start small, scale as needed
- Minimal resource allocation
- Efficient Docker images
- Competitive bidding strategy
- **Estimated cost**: ~$0.037/month

## Development Workflow

### 1. Local Development
```bash
# Start database
docker run -d -p 27017:27017 mongo:6.0

# Start backend
cd backend && npm install && npm start

# Start frontend
cd frontend && python -m http.server 8080
```

### 2. Testing
- Manual testing via web interface
- API testing with curl/Postman
- Cross-browser compatibility testing

### 3. Deployment
```bash
# Deploy to Akash
akash tx deployment create deploy.txt --from wallet
```

## Security Considerations

### 1. Network Security
- **Internal Communications**: Backend and database not exposed
- **Public Access**: Only frontend accessible from internet
- **Service Mesh**: Akash provides secure internal networking

### 2. Application Security
- **Input Validation**: All inputs sanitized and validated
- **Rate Limiting**: Prevents abuse and spam
- **CORS**: Controlled cross-origin access
- **Security Headers**: Helmet.js provides security headers

### 3. Data Security
- **Persistent Storage**: Database data survives container restarts
- **No Authentication**: Currently public (suitable for demo/hackathon)
- **Future Enhancement**: Can add authentication and authorization

## Scalability Plan

### 1. Horizontal Scaling
- Increase service count in SDL
- Load balancing automatic with Akash
- Database clustering for high availability

### 2. Vertical Scaling
- Increase CPU/memory allocation
- Monitor resource usage
- Scale based on actual demand

### 3. Performance Optimization
- CDN for static assets
- Database indexing
- API response caching
- Connection pooling

## Future Enhancements

### 1. Features
- User authentication and accounts
- Poll categories and tags
- Real-time updates via WebSockets
- Poll expiration and scheduling
- Vote analytics and insights

### 2. Technical Improvements
- TypeScript for type safety
- Unit and integration tests
- CI/CD pipeline
- Monitoring and alerting
- Database migrations

### 3. Security Enhancements
- OAuth integration
- JWT token authentication
- Role-based access control
- Audit logging
- Data encryption

## Contributing

### 1. Code Style
- JavaScript: ES6+ features, consistent formatting
- HTML: Semantic markup, accessibility
- CSS: BEM methodology, responsive design

### 2. Commit Guidelines
- Clear, descriptive commit messages
- Small, focused commits
- Feature branches for new development

### 3. Pull Request Process
- Fork repository
- Create feature branch
- Make changes with tests
- Submit pull request with description

This project structure supports rapid development while maintaining professional standards and deployment readiness on Akash Network.
