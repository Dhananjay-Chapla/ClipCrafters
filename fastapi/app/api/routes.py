"""
FastAPI route handlers for the RAG Video Script Generator API.

Endpoints:
  POST   /upload-document                Upload a document
  POST   /build-index/{document_id}      Parse → chunk → embed → index
  POST   /generate-script/{document_id}  Retrieve → generate script
  GET    /document/{document_id}/status   Document lifecycle status
  GET    /document/{document_id}/script   Fetch generated script
  DELETE /document/{document_id}          Delete document + artefacts
  POST   /regenerate-script/{doc_id}      Re-generate with new params
  POST   /search/{document_id}            Similarity search
  GET    /health                          Health check
"""

from __future__ import annotations

import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Any

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.core.logger import get_logger
from app.models.schemas import (
    DocumentStatusEnum,
    DocumentStatusResponse,
    HealthResponse,
    ScriptRequest,
    ScriptResponse,
    SearchRequest,
    SearchResponse,
    SearchResult,
    UploadResponse,
    ChunkMetadata,
)
from app.rag.embedder import Embedder
from app.rag.faiss_index import FAISSIndex
from app.rag.retriever import Retriever
from app.rag.script_generator import ScriptGenerator
from app.services.chunker import DocumentChunker
from app.services.parsers import ParserFactory
from app.utils.helpers import (
    generate_document_id,
    get_file_extension,
    validate_file_extension,
)
from app.utils.fallback_script import generate_fallback_script

logger = get_logger(__name__)
router = APIRouter()

# ────────────────────────── In-memory document registry ───────────
# In a production system this would be a database. For the MVP we
# keep a simple dict keyed by document_id.
_document_registry: dict[str, dict[str, Any]] = {}


# ────────────────────────── Helpers ───────────────────────────────

def _get_doc(document_id: str) -> dict:
    """Retrieve a document record or raise 404."""
    doc = _document_registry.get(document_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document '{document_id}' not found.")
    return doc


def _save_script(document_id: str, script: ScriptResponse) -> Path:
    """Persist the generated script to disk as JSON."""
    scripts_dir = settings.resolve_path(settings.scripts_dir)
    path = scripts_dir / f"{document_id}.json"
    path.write_text(script.model_dump_json(indent=2), encoding="utf-8")
    return path


def _load_script(document_id: str) -> ScriptResponse | None:
    """Load a previously saved script from disk."""
    scripts_dir = settings.resolve_path(settings.scripts_dir)
    path = scripts_dir / f"{document_id}.json"
    if not path.exists():
        return None
    data = json.loads(path.read_text(encoding="utf-8"))
    return ScriptResponse(**data)


# ────────────────────────── Lazy singletons ───────────────────────

_embedder: Embedder | None = None
_generator: ScriptGenerator | None = None


def _get_embedder() -> Embedder:
    global _embedder
    if _embedder is None:
        _embedder = Embedder()
    return _embedder


def _get_generator() -> ScriptGenerator:
    global _generator
    if _generator is None:
        _generator = ScriptGenerator()
    return _generator


# ══════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════


@router.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Simple health check."""
    return HealthResponse()


@router.get("/fallback-script", response_model=ScriptResponse, tags=["Demo"])
async def get_fallback_script():
    """
    Get a fallback/demo script about Artificial Intelligence and Human Psychology.
    This can be used for testing, demos, or as a fallback when script generation fails.
    """
    return generate_fallback_script(document_id="demo_fallback")


@router.get("/dummy-transcript", tags=["Demo"])
async def get_dummy_transcript():
    """
    Get the raw dummy transcript text.
    This is the constant transcript used throughout the system as a fallback.
    """
    from app.utils.fallback_script import get_dummy_transcript
    return {
        "transcript": get_dummy_transcript(),
        "scene_count": 7,
        "topic": "Artificial Intelligence and Human Psychology"
    }


@router.post("/generate-fallback-script/{document_id}", response_model=ScriptResponse, tags=["Pipeline"])
async def generate_fallback_for_document(document_id: str):
    """
    Generate and save a fallback script for a specific document.
    Useful when the actual script generation fails.
    """
    doc = _get_doc(document_id)
    
    try:
        # Generate fallback script
        script = generate_fallback_script(document_id=document_id)
        
        # Save it
        _save_script(document_id, script)
        
        # Update document status
        doc["status"] = DocumentStatusEnum.GENERATED
        doc["updated_at"] = datetime.utcnow()
        
        logger.info(f"Fallback script generated and saved for {document_id}")
        return script
        
    except Exception as exc:
        logger.error(f"Failed to generate fallback script for {document_id}: {exc}")
        raise HTTPException(status_code=500, detail=str(exc))


# ────────────────────────── Upload ────────────────────────────────


@router.post("/upload-document", response_model=UploadResponse, tags=["Documents"])
async def upload_document(file: UploadFile = File(...)):
    """Upload a document (PDF, DOCX, PPTX, TXT) for processing."""

    # Validate extension
    if not file.filename or not validate_file_extension(file.filename):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: pdf, docx, pptx, txt.",
        )

    # Read content and validate size
    content = await file.read()
    if len(content) > settings.max_upload_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.max_upload_size_mb} MB limit.",
        )

    # Save to disk
    doc_id = generate_document_id()
    upload_dir = settings.resolve_path(settings.upload_dir)
    ext = get_file_extension(file.filename)
    saved_path = upload_dir / f"{doc_id}.{ext}"
    saved_path.write_bytes(content)

    # Register
    _document_registry[doc_id] = {
        "document_id": doc_id,
        "filename": file.filename,
        "extension": ext,
        "file_path": str(saved_path),
        "file_size_bytes": len(content),
        "status": DocumentStatusEnum.UPLOADED,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "error": None,
        "chunk_count": None,
    }

    logger.info("Uploaded document %s (%s, %d bytes)", doc_id, file.filename, len(content))

    return UploadResponse(
        document_id=doc_id,
        filename=file.filename,
        file_size_bytes=len(content),
    )


# ────────────────────────── Build Index ───────────────────────────


@router.post("/build-index/{document_id}", tags=["Pipeline"])
async def build_index(document_id: str):
    """Parse, chunk, embed, and index a previously uploaded document."""

    doc = _get_doc(document_id)

    if doc["status"] not in (
        DocumentStatusEnum.UPLOADED,
        DocumentStatusEnum.PARSED,
        DocumentStatusEnum.FAILED,
    ):
        raise HTTPException(
            status_code=409,
            detail=f"Document is in state '{doc['status']}'. Cannot re-index.",
        )

    file_path = Path(doc["file_path"])
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Uploaded file not found on disk.")

    try:
        # ── Parse ─────────────────────────────────────────────────
        doc["status"] = DocumentStatusEnum.PARSING
        doc["updated_at"] = datetime.utcnow()

        parser = ParserFactory.get_parser(doc["extension"])
        pages = parser.parse(file_path)

        doc["status"] = DocumentStatusEnum.PARSED
        doc["updated_at"] = datetime.utcnow()

        # ── Chunk ─────────────────────────────────────────────────
        chunker = DocumentChunker()
        chunks = chunker.chunk_document(pages, source_file=doc["filename"])
        doc["chunk_count"] = len(chunks)

        # ── Cache parsed text ─────────────────────────────────────
        parsed_dir = settings.resolve_path(settings.parsed_dir)
        parsed_path = parsed_dir / f"{document_id}.json"
        parsed_path.write_text(
            json.dumps([c.model_dump() for c in chunks], default=str),
            encoding="utf-8",
        )

        # ── Embed ─────────────────────────────────────────────────
        doc["status"] = DocumentStatusEnum.INDEXING
        doc["updated_at"] = datetime.utcnow()

        embedder = _get_embedder()
        texts = [c.text for c in chunks]
        embeddings = embedder.embed_texts(texts)

        # ── Index ─────────────────────────────────────────────────
        index = FAISSIndex(dimension=embedder.dimension)
        index.add_documents(chunks, embeddings)

        index_dir = settings.resolve_path(settings.index_dir) / document_id
        index.save(index_dir)

        doc["status"] = DocumentStatusEnum.INDEXED
        doc["updated_at"] = datetime.utcnow()

        logger.info("Index built for %s — %d chunks", document_id, len(chunks))

        return {
            "document_id": document_id,
            "status": "indexed",
            "chunk_count": len(chunks),
            "message": "Document parsed, chunked, embedded, and indexed successfully.",
        }

    except Exception as exc:
        doc["status"] = DocumentStatusEnum.FAILED
        doc["error"] = str(exc)
        doc["updated_at"] = datetime.utcnow()
        logger.error("Index build failed for %s: %s", document_id, exc)
        raise HTTPException(status_code=500, detail=str(exc))


# ────────────────────────── Generate Script ───────────────────────


@router.post(
    "/generate-script/{document_id}",
    response_model=ScriptResponse,
    tags=["Pipeline"],
)
async def generate_script(
    document_id: str, 
    request: ScriptRequest = ScriptRequest(),
    use_fallback_on_error: bool = False
):
    """
    Retrieve relevant chunks and generate a video script via Groq LLM.
    
    Args:
        document_id: The document to generate script for
        request: Script generation parameters
        use_fallback_on_error: If True, automatically use fallback script on generation failure
    """

    doc = _get_doc(document_id)

    if doc["status"] not in (
        DocumentStatusEnum.INDEXED,
        DocumentStatusEnum.GENERATED,
    ):
        raise HTTPException(
            status_code=409,
            detail=f"Document must be indexed first. Current status: '{doc['status']}'.",
        )

    try:
        doc["status"] = DocumentStatusEnum.GENERATING
        doc["updated_at"] = datetime.utcnow()

        # Load index
        index_dir = settings.resolve_path(settings.index_dir) / document_id
        index = FAISSIndex.load(index_dir)

        # Retrieve
        embedder = _get_embedder()
        retriever = Retriever(index=index, embedder=embedder)

        # Multi-query: use the goal + a few rewritten variants
        queries = _expand_queries(request.goal, request.focus_areas)
        retrieved = retriever.multi_query_retrieve(queries, top_k=settings.top_k)

        # Generate script
        generator = _get_generator()
        script = generator.generate(retrieved, request, document_id)

        # Persist
        _save_script(document_id, script)

        doc["status"] = DocumentStatusEnum.GENERATED
        doc["updated_at"] = datetime.utcnow()

        logger.info("Script generated for %s", document_id)
        return script

    except Exception as exc:
        doc["status"] = DocumentStatusEnum.FAILED
        doc["error"] = str(exc)
        doc["updated_at"] = datetime.utcnow()
        logger.error("Script generation failed for %s: %s", document_id, exc)
        
        # If use_fallback_on_error is True, generate and return fallback script
        if use_fallback_on_error:
            logger.info("Generating fallback script for %s due to error", document_id)
            try:
                fallback_script = generate_fallback_script(document_id=document_id)
                _save_script(document_id, fallback_script)
                doc["status"] = DocumentStatusEnum.GENERATED
                doc["updated_at"] = datetime.utcnow()
                logger.info("Fallback script generated and saved for %s", document_id)
                return fallback_script
            except Exception as fallback_exc:
                logger.error("Fallback script generation also failed for %s: %s", document_id, fallback_exc)
                raise HTTPException(status_code=500, detail=f"Script generation failed: {str(exc)}. Fallback also failed: {str(fallback_exc)}")
        
        raise HTTPException(status_code=500, detail=str(exc))


# ────────────────────────── Regenerate Script ─────────────────────


@router.post(
    "/regenerate-script/{document_id}",
    response_model=ScriptResponse,
    tags=["Pipeline"],
)
async def regenerate_script(document_id: str, request: ScriptRequest = ScriptRequest()):
    """Re-generate a script with potentially different parameters."""
    doc = _get_doc(document_id)
    # Allow regeneration from INDEXED or GENERATED states
    if doc["status"] not in (
        DocumentStatusEnum.INDEXED,
        DocumentStatusEnum.GENERATED,
    ):
        raise HTTPException(
            status_code=409,
            detail=f"Document must be indexed. Current status: '{doc['status']}'.",
        )
    return await generate_script(document_id, request)


# ────────────────────────── Document Status ───────────────────────


@router.get(
    "/document/{document_id}/status",
    response_model=DocumentStatusResponse,
    tags=["Documents"],
)
async def get_document_status(document_id: str):
    """Get the current processing status of a document."""
    doc = _get_doc(document_id)
    return DocumentStatusResponse(
        document_id=doc["document_id"],
        filename=doc["filename"],
        status=doc["status"],
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
        error=doc.get("error"),
        chunk_count=doc.get("chunk_count"),
    )


# ────────────────────────── Fetch Script ──────────────────────────


@router.get(
    "/document/{document_id}/script",
    response_model=ScriptResponse,
    tags=["Documents"],
)
async def get_document_script(document_id: str):
    """Retrieve a previously generated script."""
    _get_doc(document_id)  # verify existence

    script = _load_script(document_id)
    if script is None:
        raise HTTPException(status_code=404, detail="No script generated for this document yet.")
    return script


# ────────────────────────── Delete Document ───────────────────────


@router.delete("/document/{document_id}", tags=["Documents"])
async def delete_document(document_id: str):
    """Delete a document and all associated artefacts (files, index, script)."""
    doc = _get_doc(document_id)

    # Remove uploaded file
    file_path = Path(doc["file_path"])
    if file_path.exists():
        file_path.unlink()

    # Remove parsed cache
    parsed = settings.resolve_path(settings.parsed_dir) / f"{document_id}.json"
    if parsed.exists():
        parsed.unlink()

    # Remove FAISS index directory
    index_dir = settings.resolve_path(settings.index_dir) / document_id
    if index_dir.exists():
        shutil.rmtree(index_dir)

    # Remove script
    script_path = settings.resolve_path(settings.scripts_dir) / f"{document_id}.json"
    if script_path.exists():
        script_path.unlink()

    del _document_registry[document_id]
    logger.info("Deleted document %s and all artefacts", document_id)

    return {"document_id": document_id, "message": "Document and all artefacts deleted."}


# ────────────────────────── Similarity Search ─────────────────────


@router.post(
    "/search/{document_id}",
    response_model=SearchResponse,
    tags=["Search"],
)
async def search_document(document_id: str, request: SearchRequest):
    """Run a similarity search against an indexed document."""
    doc = _get_doc(document_id)

    if doc["status"] not in (
        DocumentStatusEnum.INDEXED,
        DocumentStatusEnum.GENERATED,
    ):
        raise HTTPException(
            status_code=409,
            detail="Document must be indexed before searching.",
        )

    index_dir = settings.resolve_path(settings.index_dir) / document_id
    index = FAISSIndex.load(index_dir)
    embedder = _get_embedder()

    query_vec = embedder.embed_query(request.query)
    raw_results = index.search_similar(query_vec, top_k=request.top_k)

    results = [
        SearchResult(
            chunk_id=r["metadata"].get("chunk_id", ""),
            text=r["text"],
            score=r["score"],
            metadata=ChunkMetadata(**r["metadata"]),
        )
        for r in raw_results
    ]

    return SearchResponse(
        document_id=document_id,
        query=request.query,
        results=results,
    )


# ────────────────────────── Query Expansion ───────────────────────


def _expand_queries(goal: str, focus_areas: list[str]) -> list[str]:
    """Generate multiple query variants for multi-query retrieval.

    Creates the original goal plus one query per focus area to improve recall.
    """
    queries = [goal]
    for area in focus_areas:
        queries.append(f"{goal} — focusing on {area}")
    # Always add a broad summary query
    if len(queries) == 1:
        queries.append(f"Key findings and main contributions: {goal}")
    return queries
