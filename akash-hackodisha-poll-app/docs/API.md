# API Documentation

## Base URL
- Production: `https://your-akash-deployment.com/api`
- Development: `http://localhost:3000/api`

## Authentication
This API currently does not require authentication. All endpoints are publicly accessible.

## Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP address
- **Response**: 429 Too Many Requests when limit exceeded

## Error Responses
All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Endpoints

### Health Check
Check if the API is running and database is connected.

**GET** `/health`

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-09-01T10:30:00.000Z",
  "uptime": 3600,
  "environment": "production"
}
```

### Get All Polls
Retrieve all polls, sorted by creation date (newest first).

**GET** `/api/polls`

**Response:**
```json
[
  {
    "_id": "64f1234567890abcdef12345",
    "title": "What's your favorite programming language?",
    "options": [
      {
        "text": "JavaScript",
        "votes": 45,
        "_id": "64f1234567890abcdef12346"
      },
      {
        "text": "Python",
        "votes": 67,
        "_id": "64f1234567890abcdef12347"
      }
    ],
    "createdAt": "2024-09-01T10:00:00.000Z",
    "updatedAt": "2024-09-01T10:30:00.000Z"
  }
]
```

### Get Specific Poll
Retrieve a single poll by its ID.

**GET** `/api/polls/:id`

**Parameters:**
- `id` (string): MongoDB ObjectId of the poll

**Response:**
```json
{
  "_id": "64f1234567890abcdef12345",
  "title": "What's your favorite programming language?",
  "options": [
    {
      "text": "JavaScript",
      "votes": 45,
      "_id": "64f1234567890abcdef12346"
    }
  ],
  "createdAt": "2024-09-01T10:00:00.000Z",
  "updatedAt": "2024-09-01T10:30:00.000Z"
}
```

**Error Responses:**
- `400`: Invalid poll ID format
- `404`: Poll not found

### Create New Poll
Create a new poll with multiple options.

**POST** `/api/polls`

**Request Body:**
```json
{
  "title": "What's your favorite programming language?",
  "options": ["JavaScript", "Python", "Go", "Rust"]
}
```

**Validation Rules:**
- `title`: 5-200 characters, required
- `options`: Array of 2-10 strings, each 1-100 characters

**Response:**
```json
{
  "success": true,
  "message": "Poll created successfully",
  "poll": {
    "_id": "64f1234567890abcdef12345",
    "title": "What's your favorite programming language?",
    "options": [
      {
        "text": "JavaScript",
        "votes": 0,
        "_id": "64f1234567890abcdef12346"
      }
    ],
    "createdAt": "2024-09-01T10:00:00.000Z",
    "updatedAt": "2024-09-01T10:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Validation failed
- `500`: Server error

### Vote on Poll
Cast a vote for one of the poll options.

**POST** `/api/polls/:id/vote`

**Parameters:**
- `id` (string): MongoDB ObjectId of the poll

**Request Body:**
```json
{
  "optionIndex": 1
}
```

**Validation Rules:**
- `optionIndex`: Non-negative integer, must be valid option index

**Response:**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "poll": {
    "_id": "64f1234567890abcdef12345",
    "title": "What's your favorite programming language?",
    "options": [
      {
        "text": "JavaScript",
        "votes": 45,
        "_id": "64f1234567890abcdef12346"
      },
      {
        "text": "Python",
        "votes": 68,
        "_id": "64f1234567890abcdef12347"
      }
    ],
    "createdAt": "2024-09-01T10:00:00.000Z",
    "updatedAt": "2024-09-01T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400`: Invalid poll ID or option index
- `404`: Poll not found
- `500`: Server error

### Delete Poll (Admin)
Delete a poll and all its votes.

**DELETE** `/api/polls/:id`

**Parameters:**
- `id` (string): MongoDB ObjectId of the poll

**Response:**
```json
{
  "success": true,
  "message": "Poll deleted successfully"
}
```

**Error Responses:**
- `400`: Invalid poll ID format
- `404`: Poll not found
- `500`: Server error

## Data Models

### Poll Model
```javascript
{
  _id: ObjectId,           // Auto-generated MongoDB ID
  title: String,           // Poll question (5-200 chars)
  options: [               // Array of poll options
    {
      _id: ObjectId,       // Auto-generated option ID
      text: String,        // Option text (1-100 chars)
      votes: Number        // Vote count (default: 0)
    }
  ],
  createdAt: Date,         // Auto-generated creation timestamp
  updatedAt: Date          // Auto-updated modification timestamp
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation failed)
- `404`: Not Found
- `429`: Too Many Requests (rate limited)
- `500`: Internal Server Error

## CORS Policy
The API accepts requests from:
- `http://localhost:3000` (development)
- `http://localhost:8080` (development)
- Same-origin requests in production

## Security Features
- **Helmet.js**: Security headers
- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: All inputs sanitized and validated
- **CORS**: Controlled cross-origin access
- **Error Handling**: Detailed errors in development, generic in production
