# OpenChat AI

A production-ready, full-stack AI chatbot application powered by open-source models via Ollama.

## Features

- **Streaming Chat** - Real-time streaming responses with Server-Sent Events
- **Authentication** - JWT-based auth with registration/login
- **Conversation History** - Persistent chat history with full CRUD
- **RAG (Retrieval-Augmented Generation)** - Upload documents (PDF, TXT, MD, DOCX) for context-aware responses
- **Model Selection** - Switch between any locally available Ollama models
- **Prompt Library** - Save and reuse prompt templates
- **Project Workspaces** - Organize conversations and documents by project
- **Admin Dashboard** - User management and usage statistics
- **Dark Mode UI** - Clean, modern interface comparable to ChatGPT

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS
- Zustand (state management)
- React Router v6
- React Markdown + Syntax Highlighting
- Vite

### Backend
- FastAPI (Python 3.11+)
- PostgreSQL + SQLAlchemy 2.0 (async)
- Alembic (migrations)
- Ollama (local LLM inference)
- ChromaDB (vector store for RAG)
- LangChain (document processing)
- Redis (caching)

## Quick Start

### Prerequisites
- Docker & Docker Compose
- 8GB+ RAM (for running LLMs locally)

### Using Docker (Recommended)

```bash
# Clone the repo
git clone <repo-url>
cd openchat-ai

# Copy environment file
cp .env.example .env

# Start all services
docker compose up -d

# Pull a model (first time only)
docker compose exec ollama ollama pull llama3.2

# Access the app
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

### Local Development

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"

# Start PostgreSQL and Redis (use Docker or install locally)
docker compose up -d postgres redis ollama

# Run the server
uvicorn app.main:app --reload --port 8000
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/auth/login` | Login |
| GET | `/api/v1/auth/me` | Get current user |
| GET | `/api/v1/chat/conversations` | List conversations |
| POST | `/api/v1/chat/conversations` | Create conversation |
| POST | `/api/v1/chat/conversations/{id}/messages` | Send message (streaming) |
| GET | `/api/v1/models` | List available models |
| POST | `/api/v1/documents` | Upload document for RAG |
| GET | `/api/v1/workspaces` | List workspaces |
| GET | `/api/v1/prompts` | List prompt templates |
| GET | `/api/v1/admin/stats` | Admin statistics |

## Architecture

```
openchat-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/   # Route handlers
│   │   ├── core/               # Config, security, dependencies
│   │   ├── db/                 # Database setup
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   └── services/           # Business logic (Ollama, RAG)
│   ├── tests/
│   ├── alembic/
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── store/              # Zustand stores
│   │   ├── services/           # API client
│   │   └── types/              # TypeScript types
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

## Configuration

All configuration is via environment variables. See `.env.example` for available options.

## Running Tests

```bash
cd backend
pip install -e ".[dev]"
pytest
```

## Production Deployment

1. Set a strong `SECRET_KEY` in your `.env`
2. Use proper database credentials
3. Configure CORS origins for your domain
4. Use a reverse proxy (nginx included in Docker setup)
5. Enable HTTPS via your load balancer or reverse proxy
6. Pull your preferred Ollama models

## License

MIT
