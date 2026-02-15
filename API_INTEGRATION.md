# API Integration Guide

This document explains how to integrate your existing Telegram Quiz Bot with this Mini App backend.

## Base URL

When deployed on Koyeb:
```
https://your-app-name.koyeb.app
```

For local development:
```
http://localhost:5000
```

## API Endpoints

### 1. User Management

#### Get User by Telegram ID
```http
GET /api/user?telegramId=123456789
```

**Response:**
```json
{
  "id": "uuid-here",
  "telegramId": "123456789",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Create/Register User
```http
POST /api/user
Content-Type: application/json

{
  "telegramId": "123456789",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "telegramId": "123456789",
  "username": "john_doe",
  "firstName": "John",
  "lastName": "Doe",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Quiz Management

#### Get All Quizzes for a User
```http
GET /api/quizzes?userId=user-uuid-here
```

**Response:**
```json
[
  {
    "id": "quiz-uuid-1",
    "userId": "user-uuid-here",
    "title": "JavaScript Basics",
    "description": "Test your knowledge of JavaScript",
    "isPaid": false,
    "price": 0,
    "participants": 45,
    "questionCount": 10,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Get Single Quiz with Questions
```http
GET /api/quizzes/:quizId
```

**Response:**
```json
{
  "id": "quiz-uuid-1",
  "userId": "user-uuid-here",
  "title": "JavaScript Basics",
  "description": "Test your knowledge of JavaScript",
  "isPaid": false,
  "price": 0,
  "participants": 45,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "questions": [
    {
      "id": "question-uuid-1",
      "quizId": "quiz-uuid-1",
      "question": "What is JavaScript?",
      "options": ["A language", "A framework", "A library", "An IDE"],
      "correctAnswer": 0,
      "order": 0
    }
  ]
}
```

#### Create Quiz
```http
POST /api/quizzes
Content-Type: application/json

{
  "userId": "user-uuid-here",
  "title": "JavaScript Basics",
  "description": "Test your knowledge of JavaScript",
  "isPaid": false,
  "price": 0
}
```

**Response:**
```json
{
  "id": "quiz-uuid-1",
  "userId": "user-uuid-here",
  "title": "JavaScript Basics",
  "description": "Test your knowledge of JavaScript",
  "isPaid": false,
  "price": 0,
  "participants": 0,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Update Quiz
```http
PUT /api/quizzes/:quizId
Content-Type: application/json

{
  "title": "Updated Title",
  "participants": 50
}
```

**Response:**
```json
{
  "id": "quiz-uuid-1",
  "userId": "user-uuid-here",
  "title": "Updated Title",
  "description": "Test your knowledge of JavaScript",
  "isPaid": false,
  "price": 0,
  "participants": 50,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Delete Quiz
```http
DELETE /api/quizzes/:quizId
```

**Response:**
```
204 No Content
```

### 3. Questions Management

#### Get Questions for a Quiz
```http
GET /api/quizzes/:quizId/questions
```

**Response:**
```json
[
  {
    "id": "question-uuid-1",
    "quizId": "quiz-uuid-1",
    "question": "What is JavaScript?",
    "options": ["A language", "A framework", "A library", "An IDE"],
    "correctAnswer": 0,
    "order": 0
  }
]
```

#### Add Question to Quiz
```http
POST /api/quizzes/:quizId/questions
Content-Type: application/json

{
  "question": "What is JavaScript?",
  "options": ["A language", "A framework", "A library", "An IDE"],
  "correctAnswer": 0,
  "order": 0
}
```

**Response:**
```json
{
  "id": "question-uuid-1",
  "quizId": "quiz-uuid-1",
  "question": "What is JavaScript?",
  "options": ["A language", "A framework", "A library", "An IDE"],
  "correctAnswer": 0,
  "order": 0
}
```

### 4. Statistics

#### Get User Stats
```http
GET /api/stats?userId=user-uuid-here
```

**Response:**
```json
{
  "totalQuizzes": 24,
  "freeQuizzes": 23,
  "paidQuizzes": 1,
  "engagement": 150
}
```

### 5. Health Check

#### Check API Status
```http
GET /health
```

**Response:**
```json
{
  "status": "ok"
}
```

## Integration with Your Bot

### Step 1: When User Opens Mini App

When a user opens your Mini App, the Telegram WebApp API automatically provides user data:

```javascript
const telegramUser = window.Telegram.WebApp.initDataUnsafe.user;
// {
//   id: 123456789,
//   first_name: "John",
//   last_name: "Doe",
//   username: "john_doe"
// }
```

### Step 2: Register/Login User

Call your backend to register or get the user:

```javascript
const response = await fetch(`${API_URL}/api/user`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    telegramId: telegramUser.id.toString(),
    username: telegramUser.username,
    firstName: telegramUser.first_name,
    lastName: telegramUser.last_name
  })
});

const user = await response.json();
```

### Step 3: Load User Data

Once you have the user ID, fetch their quizzes and stats:

```javascript
// Get quizzes
const quizzesRes = await fetch(`${API_URL}/api/quizzes?userId=${user.id}`);
const quizzes = await quizzesRes.json();

// Get stats
const statsRes = await fetch(`${API_URL}/api/stats?userId=${user.id}`);
const stats = await statsRes.json();
```

### Step 4: Create Quiz from Bot

When a user creates a quiz through your bot commands, you can also call this API:

```javascript
const quiz = await fetch(`${API_URL}/api/quizzes`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: user.id,
    title: "Quiz Title",
    description: "Quiz Description",
    isPaid: false,
    price: 0
  })
});
```

### Step 5: Add Questions

```javascript
const question = await fetch(`${API_URL}/api/quizzes/${quizId}/questions`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: "What is 2+2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: 1, // Index of correct answer (0-based)
    order: 0
  })
});
```

### Step 6: Update Participant Count

When someone completes a quiz:

```javascript
await fetch(`${API_URL}/api/quizzes/${quizId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    participants: currentParticipants + 1
  })
});
```

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK` - Success
- `201 Created` - Resource created successfully
- `204 No Content` - Success with no response body
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

Error responses include a JSON body:

```json
{
  "error": "Error message here"
}
```

## CORS Configuration

The backend is configured to accept requests from your Telegram Mini App. Make sure your requests include:

```javascript
headers: {
  'Content-Type': 'application/json'
}
```

## Data Storage

**Current**: In-memory storage (data persists while server is running)

**Recommended for Production**: PostgreSQL database

To switch to PostgreSQL:
1. Add `DATABASE_URL` environment variable in Koyeb
2. Use Drizzle ORM to push schema: `npm run db:push`
3. Update storage implementation to use database instead of memory

## Rate Limiting

Consider adding rate limiting in production to prevent abuse:

```javascript
// Install: npm install express-rate-limit
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Authentication

The Mini App uses Telegram's built-in authentication through the WebApp API. The `initData` parameter can be validated on the backend for additional security.

---

**Your backend is ready to integrate with your existing Telegram bot! 🎯**
