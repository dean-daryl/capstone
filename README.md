# SomaTek

An AI-powered learning platform that simplifies complex technical content (text, images, and videos) into beginner-friendly explanations. It combines a Chrome browser extension, a web analytics dashboard, and a suite of backend services including RAG (Retrieval-Augmented Generation), text classification, and local LLM inference.


## Demo Video
[https://www.loom.com/share/a409c52423df436daca190bf8c2c34ac](https://www.loom.com/share/3dae3b72119a4bc1acd65f30bde01c60)

## Link
[Link to deployed version](http://89.167.119.247/login)
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
| LLM | Ollama (llama3.2:3b) | |
| Embeddings | nomic-embed-text | |
| Translation | NLLB-200 (CTranslate2) | Python 3.11 |
| Object Storage | MinIO | |
| CLI | somatek-cli (PyInstaller) | Python 3.11 |

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
| NLLB Translate | 8002 |
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

Both ML models are gitignored due to their size. You can train them using the provided notebooks in `notebooks/`.

**Text Classification (spaCy)**

The textcat model (`models/textCat/`, ~312MB) can be trained by running `notebooks/Spacy Custom TextCat Posts.ipynb`:

- Place the trained spaCy model in `models/textCat/`
- The directory should contain: `config.cfg`, `meta.json`, `textcat_multilabel/`, `tokenizer/`, `transformer/`, `vocab/`

**NLLB Translation (English ↔ Kinyarwanda)**

The NLLB-200 model (`models/nllb-kin-ct2/`) can be fine-tuned by running `notebooks/Finetune NLLB Kin.ipynb`:

- Place the CTranslate2-converted model in `models/nllb-kin-ct2/`
- Alternatively, run `scripts/install-nllb.sh` to download a pre-converted model

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

**Infrastructure only** (databases, Qdrant, MinIO, TextCat, NLLB — for local development):

```bash
docker compose up -d
```

**Full stack including Ollama + Java backend** (requires `--profile prod`):

```bash
docker compose --profile prod up -d
```

This starts: PostgreSQL, MongoDB, MinIO, Qdrant, TextCat, NLLB Translate, Ollama (auto-pulls `llama3.2:3b` and `nomic-embed-text`), and the Java backend.

There are also alternative compose files for different environments:

| File | Use Case |
|------|----------|
| `docker-compose.yaml` | Local development (default) |
| `docker-compose.local-prod.yml` | Local production simulation |
| `docker-compose.prod.yml` | Production deployment |

Each has a corresponding `.env` file (`.env`, `.env.local-prod`, `.env.production`).

Verify all services are healthy:

```bash
docker compose ps
```

> **Note:** Ollama's first start takes several minutes as it downloads the LLM models. The backend won't start until all dependencies pass their health checks.

### 5. Start the Frontend

**Development mode** (standalone dev server with hot reload):

```bash
cd frontend
npm install
npm run dev
```

The dashboard will be available at `http://localhost:5173/dashboard`.

**Production mode:** The frontend is bundled as a SPA and served directly from the Spring Boot backend on port `8080`. No separate frontend server is needed — just access `http://localhost:8080/dashboard`.

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

### NLLB Translation Service

```bash
cd services/nllb-translate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8002
```

Requires the NLLB model at `models/nllb-kin-ct2/`.

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
│   ├── textcat/                 # Text classification microservice
│   │   ├── app/
│   │   │   ├── main.py          # FastAPI routes
│   │   │   ├── model.py         # spaCy model loading & inference
│   │   │   └── schemas.py       # Pydantic models
│   │   ├── Dockerfile
│   │   └── requirements.txt
│   └── nllb-translate/          # NLLB-200 translation microservice
│       ├── app/
│       ├── Dockerfile
│       └── requirements.txt
├── models/
│   ├── textCat/                 # Trained spaCy model (gitignored)
│   └── nllb-kin-ct2/            # NLLB translation model (gitignored)
├── notebooks/                   # Model training notebooks
│   ├── Spacy Custom TextCat Posts.ipynb
│   └── Finetune NLLB Kin.ipynb
├── scripts/                     # Deployment & setup scripts
│   ├── deploy.sh
│   ├── install.sh
│   ├── backup.sh
│   └── install-nllb.sh
├── nginx/                       # Nginx config templates
├── logs/                        # Application logs (gitignored)
├── data/                        # Docker volume data (gitignored)
├── docker-compose.yaml
├── docker-compose.local-prod.yml
├── docker-compose.prod.yml
└── .gitignore
```
## Screenshots of prototype

<img width="1496" height="338" alt="Screenshot 2026-02-13 at 07 07 17" src="https://github.com/user-attachments/assets/2b9a3ca5-81d4-40d9-a2c4-063eed22dac6" />
<img width="1518" height="1067" alt="Screenshot 2026-02-13 at 07 07 35" src="https://github.com/user-attachments/assets/bc3e61d1-e342-49dd-b7ad-497c01a7d809" />



