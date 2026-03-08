"""
Application configuration — reads all tunables from environment variables.
Uses pydantic-settings for typed, validated config with .env file support.
"""

from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


# Project root is two levels above this file (app/core/config.py → project root)
_PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    """Central configuration for the RAG Video Script Generator."""

    model_config = SettingsConfigDict(
        env_file=str(_PROJECT_ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Groq LLM ──────────────────────────────────────────
    groq_api_key: str = ""
    groq_model_name: str = "llama-3.3-70b-versatile"

    # ── Stability.ai ──────────────────────────────────────
    stability_api_key: str = ""

    # ── Gemini Image API ──────────────────────────────────
    gemini_api_key: str = ""

    # ── Embedding Model ───────────────────────────────────
    embedding_model_name: str = "all-MiniLM-L6-v2"

    # ── Chunking ──────────────────────────────────────────
    chunk_size: int = 512
    chunk_overlap: int = 64

    # ── Retrieval ─────────────────────────────────────────
    top_k: int = 10
    mmr_diversity_lambda: float = 0.5

    # ── Upload Limits ─────────────────────────────────────
    max_upload_size_mb: int = 50

    # ── Storage Paths (resolved relative to project root) ─
    upload_dir: str = "app/storage/uploads"
    index_dir: str = "app/storage/indices"
    parsed_dir: str = "app/storage/parsed"
    scripts_dir: str = "app/storage/scripts"
    projects_dir: str = "app/storage/projects"

    # ── Server ────────────────────────────────────────────
    host: str = "0.0.0.0"
    port: int = 8000
    log_level: str = "INFO"

    # ── FFmpeg Configuration ──────────────────────────────
    ffmpeg_path: str = ""  # Optional: absolute path to ffmpeg executable
    ffprobe_path: str = ""  # Optional: absolute path to ffprobe executable
    use_mock_processor: bool = False  # Set to True to use mock processor without FFmpeg

    # ── Derived helpers ───────────────────────────────────
    @property
    def project_root(self) -> Path:
        return _PROJECT_ROOT
    
    @property
    def local_ffmpeg_path(self) -> Path:
        """Path to local FFmpeg installation in fastapi/ffmpeg*/bin/"""
        # Check for ffmpeg-8.0.1-essentials_build first (actual installation)
        essentials_path = _PROJECT_ROOT / "ffmpeg-8.0.1-essentials_build" / "bin"
        if essentials_path.exists():
            return essentials_path
        
        # Check for generic ffmpeg folder (from download script)
        generic_path = _PROJECT_ROOT / "ffmpeg" / "bin"
        if generic_path.exists():
            return generic_path
        
        # Return generic path as fallback (will be checked for existence later)
        return generic_path
    
    @property
    def ffmpeg_executable(self) -> str:
        """Get FFmpeg executable path (configured, local, or system)."""
        # If configured path is set, try to use it
        if self.ffmpeg_path:
            ffmpeg_path = Path(self.ffmpeg_path)
            
            # If it's a relative path, resolve from project root
            if not ffmpeg_path.is_absolute():
                ffmpeg_path = _PROJECT_ROOT / self.ffmpeg_path
            
            # Return the absolute path as string
            return str(ffmpeg_path)
        
        # Check local installation - return absolute path
        local_ffmpeg = self.local_ffmpeg_path / "ffmpeg.exe"
        return str(local_ffmpeg)  # Return absolute path even if it doesn't exist yet
    
    @property
    def ffprobe_executable(self) -> str:
        """Get FFprobe executable path (configured, local, or system)."""
        # If configured path is set, try to use it
        if self.ffprobe_path:
            ffprobe_path = Path(self.ffprobe_path)
            
            # If it's a relative path, resolve from project root
            if not ffprobe_path.is_absolute():
                ffprobe_path = _PROJECT_ROOT / self.ffprobe_path
            
            # Return the absolute path as string
            return str(ffprobe_path)
        
        # Check local installation - return absolute path
        local_ffprobe = self.local_ffmpeg_path / "ffprobe.exe"
        return str(local_ffprobe)  # Return absolute path even if it doesn't exist yet

    def resolve_path(self, relative: str) -> Path:
        """Resolve a storage path relative to the project root and ensure it exists."""
        p = _PROJECT_ROOT / relative
        p.mkdir(parents=True, exist_ok=True)
        return p

    @property
    def max_upload_bytes(self) -> int:
        return self.max_upload_size_mb * 1024 * 1024


# Singleton — import this everywhere
settings = Settings()