# VedaAI — AI Assessment Creator

An AI-powered assessment platform for teachers to create structured question papers. Built on top of the original TestifyAI/QuizGenerator project, fully rebuilt to match the VedaAI Figma design spec.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FLOW                                     │
│                                                                  │
│  Frontend (Next.js)                                              │
│   → POST /api/assignments  (create + queue job)                  │
│   → Socket.io join room assignment:<id>                          │
│                                                                  │
│  Backend (Express)                                               │
│   → Adds job to BullMQ queue                                     │
│   → Returns assignmentId immediately                             │
│                                                                  │
│  BullMQ Worker                                                   │
│   → Picks up job from Redis queue                                │
│   → Calls Gemini AI with structured prompt                       │
│   → Saves GeneratedPaper to MongoDB                              │
│   → Emits Socket.io events (progress → completed)                │
│                                                                  │
│  Frontend (Socket.io client)                                     │
│   → Receives real-time progress events                           │
│   → Fetches paper on completion (Redis-cached)                   │
│   → Renders structured question paper                            │
│   → Exports PDF via jsPDF                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | Next.js 14 + TypeScript + Zustand + Socket.io client |
| Backend   | Node.js + Express + TypeScript                       |
| Database  | MongoDB (Mongoose)                                   |
| Cache     | Redis (ioredis) + BullMQ job queue                   |
| Realtime  | Socket.io (WebSocket)                                |
| AI        | Google Gemini 1.5 Pro / 2.0 Flash                    |
| PDF       | jsPDF (frontend export)                              |

## Prerequisites

- Node.js 18+
- MongoDB (local: `mongodb://localhost:27017` or Atlas URI)
- Redis (local: `redis://localhost:6379`)
- Google Gemini API key

### Start MongoDB locally
```bash
mongod --dbpath /data/db
```

### Start Redis locally (Windows)
```bash
# Using WSL or Docker:
docker run -d -p 6379:6379 redis:alpine
```

## Setup

### Backend

```bash
cd backend-node

# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env
# Edit .env: set GEMINI_API_KEY, MONGODB_URI, REDIS_URL

# Run in development
npm run dev
```

Backend starts on `http://localhost:3001`.

### Frontend

```bash
cd frontend-next

# Install dependencies
npm install

# Copy env file
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001

# Run in development
npm run dev
```

Frontend starts on `http://localhost:3000`.

## Environment Variables

### Backend (`backend-node/.env`)
```
PORT=3001
MONGODB_URI=mongodb://localhost:27017/vedaai
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=uploads
```

### Frontend (`frontend-next/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Features

### Assignment Creation
- File upload (PDF/image) with text extraction
- Due date picker
- Dynamic question types (MCQ, Short, Diagram/Graph, Numerical, Long Answer)
- Per-type question count and marks — validated (no empty/negative)
- Subject, Class, School fields for better output
- Additional instructions textarea

### AI Generation (Background Job)
- Job added to BullMQ queue on assignment creation
- Worker processes: builds structured Gemini prompt → parses JSON response
- Generates sections (A, B, C...) grouped by question type
- Difficulty distribution: Easy / Moderate / Hard / Challenging
- Marks per question tracked individually
- Full answer key generated

### Real-time Updates
- Socket.io WebSocket connection
- Live progress bar (0% → 100%)
- Automatic redirect on completion

### Question Paper Output
- Structured exam paper layout (school, subject, class, time, marks)
- Student info lines (name, roll number, section)
- Questions with difficulty badges (color-coded) and marks
- Answer key section
- Download as properly formatted PDF

### Caching
- Redis caches generated papers (30 min TTL)
- Invalidated on regeneration or deletion

## Original Project

The original TestifyAI (Python/FastAPI + React CRA) is preserved in:
- `backend/` — Python/FastAPI backend
- `frontend/` — React CRA frontend

The new implementation is in:
- `backend-node/` — Node.js/Express/TypeScript backend
- `frontend-next/` — Next.js/TypeScript frontend
