# SomaTek

An AI-powered learning platform that simplifies complex technical content (text, images, and videos) into beginner-friendly explanations. It combines a Chrome browser extension, a web analytics dashboard, and a suite of backend services including RAG (Retrieval-Augmented Generation), text classification, and local LLM inference.

## Tech Stack

| Component | Technology | Language |
|-----------|-----------|----------|
| Backend | Spring Boot 3.3.4 | Java 21 |
| Frontend | React 18 + Vite | JavaScript |
| Browser Extension | React 18 + Vite | TypeScript |
| Text Classification | FastAPI + spaCy | Python 3.11 |
| Relational DB | PostgreSQL 15 | |
| Document DB | MongoDB 7 | |
| Vector DB | Qdrant 1.12.1 | |
| LLM | Ollama (qwen2.5:1.5b) | |
| Embeddings | nomic-embed-text | |
| Object Storage | MinIO | |

## Port Reference

| Service | Port |
|---------|------|
| Frontend | 5173 |
| Backend | 8080 |
| TextCat Service | 8001 |
| PostgreSQL | 5432 |
| MongoDB | 27017 |
| Ollama | 11434 |
| Qdrant (REST / gRPC) | 6333 / 6334 |
| MinIO (API / Console) | 9000 / 9001 |

## Prerequisites

- **Docker** and **Docker Compose**
- **Java 21** (for local backend development)
- **Node.js 16+** and **npm** (for frontend and plugin)
- **Python 3.11** (for local textcat development)
- The trained spaCy model placed in `models/textCat/` (not committed to git — see [Model Setup](#model-setup))

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/dean-daryl/somatek.git
cd somatek
```

### 2. Model Setup

The text classification model (`models/textCat/`) is gitignored due to its size (~312MB). The model will be deployed to docker hub in form of a docker image. The work around currently is to run the notebook and download the model:

- Get the trained spaCy model and place it in `models/textCat/`
- The directory should contain: `config.cfg`, `meta.json`, `textcat_multilabel/`, `tokenizer/`, `transformer/`, `vocab/`

### 3. Environment Variables (Optional)

The docker-compose file uses sensible defaults. To override, create a `.env` file in the project root:

```env
# Database
POSTGRES_DB=rag_db
POSTGRES_USER=rag_user
POSTGRES_PASSWORD=changeme

# MongoDB
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password123
MONGO_DATABASE=somatek

# MinIO
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123

# Auth
JWT_SECRET=your-secret-key-change-this
```

### 4. Start All Services with Docker Compose

```bash
docker-compose up -d
```

This starts: PostgreSQL, MongoDB, MinIO, Ollama (auto-pulls `qwen2.5:1.5b` and `nomic-embed-text`), Qdrant, TextCat service, and the Java backend.

Verify all services are healthy:

```bash
docker-compose ps
```

> **Note:** Ollama's first start takes several minutes as it downloads the LLM models. The backend won't start until all dependencies pass their health checks.

### 5. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173/dashboard`.

### 6. Build the Browser Extension

```bash
cd plugin
npm install
npm run build
```

Load the extension in Chrome:
1. Navigate to `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `plugin/dist` directory

---

## Running Individual Services Locally (Development)

### Backend

```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Requires PostgreSQL, MongoDB, Qdrant, Ollama, and TextCat running locally or via Docker.

### TextCat Service

```bash
cd services/textcat
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

Requires the spaCy model at `models/textCat/` (the local path must be adjusted in `app/model.py` or passed as an argument).

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## API Endpoints

Full Swagger UI is available at `http://localhost:8080/public/swagger-ui.html` when the backend is running.

---

## Deployment Plan

### Infrastructure Overview

```
                    ┌─────────────────┐
                    │   Bare Metal VPS│
                    │   (Cloud Host)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼──────────────────── ┐
        │                    │                     │
   ┌────▼─────┐      ┌───────▼───────┐     ┌───────▼───────┐
   │ Frontend  │     │  Java Backend │    │ TextCat Svc   │
   │ (Static)  │     │  (Docker)     │    │ (Docker)      │
   └───────────┘     └───────┬───────┘    └───────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐  ┌─────▼─────┐ ┌─────▼─────┐
        │ PostgreSQL│ │  MongoDB   │ │  Qdrant   │
        │ (Managed) │ │  Atlas     │ │ (Hosted)  │
        └───────────┘  └───────────┘ └───────────┘
```

---

## Project Structure

```
somatek/
├── backend/                     # Spring Boot API
│   ├── src/main/java/.../
│   │   ├── controllers/         # REST endpoints
│   │   ├── models/              # JPA entities
│   │   ├── dto/                 # Request/response DTOs
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Data access layer
│   │   └── config/              # Security, CORS, etc.
│   ├── src/main/resources/
│   │   ├── application-dev.properties
│   │   ├── application-staging.properties
│   │   └── application-production.properties
│   ├── Dockerfile
│   └── pom.xml
├── frontend/                    # React analytics dashboard
│   ├── src/
│   │   ├── views/               # Page components
│   │   ├── components/          # Reusable UI components
│   │   ├── api/                 # API service layer
│   │   └── context/             # React context providers
│   └── package.json
├── plugin/                      # Chrome browser extension
│   ├── src/
│   │   └── App.tsx              # Main extension UI
│   ├── public/
│   │   └── manifest.json        # Extension manifest v3
│   └── package.json
├── services/
│   └── textcat/                 # Text classification microservice
│       ├── app/
│       │   ├── main.py          # FastAPI routes
│       │   ├── model.py         # spaCy model loading & inference
│       │   └── schemas.py       # Pydantic models
│       ├── Dockerfile
│       └── requirements.txt
├── models/
│   └── textCat/                 # Trained spaCy model (gitignored)
├── data/                        # Docker volume data (gitignored)
├── docker-compose.yaml
└── .gitignore
```
