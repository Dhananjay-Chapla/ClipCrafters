# RAG Video Script Generator

An AI-powered backend that transforms uploaded documents (PDF, DOCX, PPTX, TXT) into structured, narration-ready educational video scripts using a **RAG pipeline** + **Groq LLM**.

---

## Architecture

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌───────────┐     ┌──────────────┐
│  Upload  │────▶│  Parse   │────▶│   Chunk      │────▶│  Embed    │────▶│ FAISS Index  │
│  (API)   │     │  (PyMuPDF│     │ (section-    │     │ (Sentence │     │ (IndexFlatIP)│
│          │     │  docx,   │     │  aware +     │     │  Trans-   │     │              │
│          │     │  pptx)   │     │  overlap)    │     │  formers) │     │              │
└──────────┘     └──────────┘     └──────────────┘     └───────────┘     └──────┬───────┘
                                                                               │
                                                                               ▼
                                                        ┌──────────────────────────────┐
                                                        │  Retriever (top-k + MMR)     │
                                                        │  Multi-query · Deduplication  │
                                                        └──────────────┬───────────────┘
                                                                       │
                                                                       ▼
                                                        ┌──────────────────────────────┐
                                                        │  Groq LLM (llama-3.3-70b)   │
                                                        │  Prompt templates · Retry    │
                                                        │  Token-safe truncation       │
                                                        └──────────────┬───────────────┘
                                                                       │
                                                                       ▼
                                                        ┌──────────────────────────────┐
                                                        │  Structured Script JSON      │
                                                        │  (hook, sections, visuals…)  │
                                                        └──────────────────────────────┘
```

## Data Flow

1. **Upload** → file saved + document ID assigned
2. **Build Index** → parse → chunk → embed → FAISS index saved to disk
3. **Generate Script** → retrieve top-k chunks with MMR → construct prompt → Groq generates structured JSON script

---

## Quick Start

### 1. Clone & Install

```bash
cd fastapi
python -m venv venv

# On Windows
.\venv\Scripts\activate

# On Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables

```bash
# Copy the sample environment file
cp .env.sample .env

# Edit .env and add your API keys:
# - GROQ_API_KEY: Get from https://console.groq.com/keys
# - MURF_API_KEY: Get from https://murf.ai/
# - STABILITY_API_KEY: Get from https://platform.stability.ai/account/keys (optional)
# - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey (optional)
```

**Required API Keys:**
- **Groq API**: For LLM-powered script generation
- **Murf AI API**: For high-quality text-to-speech narration
- **Stability.ai API**: For image generation (optional)
- **Google Gemini API**: For additional AI features (optional)

### 3. Run Server

```bash
# Make sure you're in the fastapi directory with venv activated
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open **http://localhost:8000/docs** for the interactive Swagger UI.
Access the frontend at **http://localhost:8000/ui/index.html**

---

## API Usage (curl examples)

### Health check
```bash
curl http://localhost:8000/health
```

### Upload a document
```bash
curl -X POST http://localhost:8000/upload-document \
  -F "file=@my_paper.pdf"
```

### Build index
```bash
curl -X POST http://localhost:8000/build-index/{DOCUMENT_ID}
```

### Generate script
```bash
curl -X POST http://localhost:8000/generate-script/{DOCUMENT_ID} \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Generate a 3-minute beginner-friendly video script",
    "target_audience": "college students",
    "tone": "youtube-explainer",
    "duration_minutes": 3,
    "include_analogies": true,
    "include_visual_cues": true
  }'
```

### Fetch the generated script
```bash
curl http://localhost:8000/document/{DOCUMENT_ID}/script
```

### Check document status
```bash
curl http://localhost:8000/document/{DOCUMENT_ID}/status
```

### Similarity search
```bash
curl -X POST http://localhost:8000/search/{DOCUMENT_ID} \
  -H "Content-Type: application/json" \
  -d '{"query": "what is the main contribution?", "top_k": 5}'
```

### Delete document
```bash
curl -X DELETE http://localhost:8000/document/{DOCUMENT_ID}
```

---

## How FAISS Indexing Works

## Scene Validation & Quality Assurance

The system includes comprehensive validation to ensure every scene has properly aligned assets:

### Validation Features:
- **Script Validation**: Ensures narration text is meaningful and sufficient
- **Image Prompt Quality Scoring**: Validates prompts are specific and concept-grounded (0-1 score)
- **Asset Alignment Checking**: Verifies narration and image prompts share common concepts
- **Generic Phrase Detection**: Flags vague prompts that may produce irrelevant images
- **Asset Status Tracking**: Monitors audio, image, and clip generation status

### Validation Endpoints:
```bash
# Validate a single scene
curl http://localhost:8000/scenes/{scene_id}/validate?project_id={project_id}

# Validate all scenes in a project
curl http://localhost:8000/projects/{project_id}/validate-all
```

### Quality Assurance Rules:
1. **No Generic Fallbacks**: Removed random stock photo fallbacks (loremflickr)
2. **Concept-Specific Placeholders**: Local placeholders display key concepts from the prompt
3. **Strict Prompt Validation**: Requires 15+ words and 8+ meaningful content words
4. **Narration-Grounded Prompts**: All image prompts must reference specific narration content
5. **Multi-Stage Enrichment**: Visual planner validates and rewrites vague prompts

### Image Generation Priority:
1. **Primary**: Gemini Imagen (high quality, concept-accurate)
2. **Fallback**: Stability.ai (if Gemini fails)
3. **No other fallbacks**: If both fail, a detailed error message is shown

**Important**: Pollinations and local placeholder generation have been removed. Only Gemini and Stability.ai are used for image generation. If both providers fail, the system will show a comprehensive error message with troubleshooting steps.

### 📚 Comprehensive Documentation:
- **[Scene Generation Guide](SCENE_GENERATION_GUIDE.md)** - Complete workflow and best practices
- **[Scene Alignment Checklist](SCENE_ALIGNMENT_CHECKLIST.md)** - Quick reference for developers
- **[Workflow Diagram](WORKFLOW_DIAGRAM.md)** - Visual representation of the pipeline
- **[Changes Summary](CHANGES_SUMMARY.md)** - Detailed technical changes
- **[Implementation Summary](IMPLEMENTATION_SUMMARY.md)** - High-level overview

---

## How FAISS Indexing Works

1. Document text is split into overlapping chunks (~512 chars with 64-char overlap).
2. Each chunk is embedded using **SentenceTransformers** (`all-MiniLM-L6-v2`) into a 384-dim vector, L2-normalised.
3. Vectors are added to a **FAISS IndexFlatIP** (inner-product = cosine similarity with normalised vectors).
4. A JSON sidecar stores chunk texts + metadata (page, heading, source file).
5. The index is saved to disk and can be reloaded without recomputing embeddings.

## How the RAG Prompt Is Constructed

1. **Retrieval**: Top-k chunks retrieved via FAISS, re-ranked using **MMR** for diversity.
2. **Context Block**: Chunks are formatted with IDs, source metadata, and relevance scores.
3. **Token Safety**: Context is truncated if it exceeds ~24k tokens to stay within model limits.
4. **System Prompt**: Instructs the LLM to act as an educational scriptwriter with strict grounding rules.
5. **User Prompt**: Contains the context block + all user controls (tone, audience, duration, focus areas).
6. **Output Parsing**: JSON response is parsed into a typed `ScriptResponse` with fallback for malformed output.

---

## Configuration

All settings are in `.env` — see `.env.sample` for the full list:

| Variable | Default | Description |
|----------|---------|-------------|
| `GROQ_API_KEY` | — | Your Groq API key (required) |
| `GROQ_MODEL_NAME` | `llama-3.3-70b-versatile` | Groq model to use |
| `MURF_API_KEY` | — | Murf AI API key for text-to-speech (required) |
| `STABILITY_API_KEY` | — | Stability.ai API key for image generation |
| `GEMINI_API_KEY` | — | Google Gemini API key |
| `EMBEDDING_MODEL_NAME` | `all-MiniLM-L6-v2` | SentenceTransformers model |
| `CHUNK_SIZE` | `512` | Characters per chunk |
| `CHUNK_OVERLAP` | `64` | Overlap between chunks |
| `TOP_K` | `10` | Chunks retrieved per query |
| `MMR_DIVERSITY_LAMBDA` | `0.5` | MMR diversity parameter (0-1) |
| `MAX_UPLOAD_SIZE_MB` | `50` | Max upload file size |
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `LOG_LEVEL` | `INFO` | Logging level |

---

## Future Improvements

- [ ] **Multiple Voice Options** — Support for different Murf AI voices and languages
- [ ] **Voice Customization** — Speed, pitch, and emphasis controls
- [ ] **Image Generation** — DALL-E / Stable Diffusion for visual assets per section
- [ ] **Video Assembly** — FFmpeg pipeline combining narration + visuals
- [ ] **PostgreSQL** — replace in-memory registry with a database
- [ ] **Celery/Redis** — background task queue for large documents
- [ ] **React Frontend** — upload UI, script viewer, regeneration controls
- [ ] **Authentication** — API key or OAuth
- [ ] **Streaming** — stream script generation via SSE
- [ ] **Multi-document** — cross-reference multiple documents in one script

---

## Project Structure

```
fastapi/
├── app/
│   ├── api/
│   │   ├── routes.py          # Document management endpoints
│   │   └── video_routes.py    # Video generation endpoints
│   ├── core/
│   │   ├── config.py          # Pydantic settings
│   │   └── logger.py          # Structured logging
│   ├── models/
│   │   ├── schemas.py         # Request/response Pydantic models
│   │   └── video_schemas.py   # Video-related schemas
│   ├── prompts/
│   │   ├── system_prompt.py   # System prompt template
│   │   └── user_prompt.py     # User prompt builder
│   ├── rag/
│   │   ├── embedder.py        # SentenceTransformers wrapper
│   │   ├── faiss_index.py     # FAISS index + metadata sidecar
│   │   ├── retriever.py       # Top-k + MMR + dedup retriever
│   │   └── script_generator.py # Groq LLM integration
│   ├── services/
│   │   ├── parsers.py         # PDF / DOCX / PPTX / TXT parsers
│   │   └── chunker.py         # Intelligent document chunking
│   ├── storage/               # Runtime data (uploads, indices, scripts)
│   │   ├── uploads/           # Uploaded documents
│   │   ├── indices/           # FAISS indices
│   │   ├── parsed/            # Parsed document text
│   │   ├── scripts/           # Generated scripts
│   │   └── projects/          # Video project assets
│   ├── video/                 # Video generation modules
│   └── main.py                # FastAPI app entry point
├── frontend/                  # Frontend static files
├── venv/                      # Virtual environment (not in git)
├── .env                       # Environment variables (not in git)
├── .env.sample                # Sample environment file
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

---

## License

MIT
