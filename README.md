# 🗳️ Decentralized Polling App for Akash x Hackodisha

This is a proof-of-concept for a full-stack, decentralized polling application designed to run on the **Akash Network**. This project was created for the **Akash x Hackodisha Hackathon**.

## 🚀 Project Overview

The application is built on a classic 3-tier architecture, ensuring scalability and security by design.

### Architecture

1. **Frontend**: A lightweight web interface built with vanilla HTML/CSS/JavaScript and served by an NGINX web server. This is the only publicly accessible component.
2. **Backend**: A Node.js/Express API server responsible for handling business logic, such as receiving votes and retrieving poll results. It communicates exclusively with the frontend and the database.
3. **Database**: A MongoDB instance for persistent data storage. It only accepts connections from the backend service, ensuring data integrity and security.

## 🔧 Features

- **Create Polls**: Users can create new polls with multiple options
- **Vote**: Secure voting system with real-time results
- **View Results**: Live poll results with visual representation
- **Decentralized**: Runs entirely on Akash Network infrastructure

## ☁️ Akash Deployment

The entire application is defined in the `deploy.txt` file using Akash's Stack Definition Language (SDL). The SDL configuration highlights several key features:

* **Multi-Service Deployment**: Defines three distinct services (`frontend`, `backend`, `db`).
* **Secure Internal Networking**: Services communicate over a private network. Only the frontend is exposed to the internet via an ingress controller.
* **Persistent Storage**: The database uses a persistent storage volume (`class: beta2`) to ensure data is not lost between deployments.
* **Resource Segregation**: Each service has its own compute profile, allowing for tailored resource allocation.

## 📁 Project Structure

```
akash-hackodisha-poll-app/
├── frontend/
│   ├── index.html      # Main web interface
│   ├── styles.css      # Styling
│   └── app.js          # Frontend logic
├── backend/
│   ├── server.js       # Express API server
│   └── package.json    # Node.js dependencies
├── docs/
│   ├── API.md          # API documentation
│   └── DEPLOYMENT.md   # Deployment guide
├── deploy.txt          # Akash SDL configuration
└── README.md           # This file
```

## 🚀 Local Development

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
Simply open `frontend/index.html` in a browser or serve via a local web server.

## 📊 API Endpoints

- `GET /api/polls` - Get all polls
- `POST /api/polls` - Create a new poll
- `GET /api/polls/:id` - Get specific poll
- `POST /api/polls/:id/vote` - Vote on a poll

## 🔐 Security Features

- **Private Service Communication**: Backend and database are not exposed to the internet
- **Input Validation**: All API inputs are validated
- **Rate Limiting**: Protection against spam voting
- **CORS Configuration**: Secure cross-origin requests

---
*This project serves as a foundational template for building robust, decentralized applications on Akash Network.*