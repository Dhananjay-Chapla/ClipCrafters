import os
import json
from enum import Enum
from typing import Dict, Any, List, Optional
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate

from app.core.config import settings
from app.core.logger import get_logger
from app.models.video_schemas import SceneResponse, VisualConceptResponse

logger = get_logger(__name__)


class StylePreset(str, Enum):
    GHIBLI = "ghibli_educational"
    SCIENTIFIC = "scientific_infographic"
    TEXTBOOK = "textbook_diagram"
    CINEMATIC = "cinematic_educational"
    MINIMALIST = "minimalist_biology"
    STORYBOOK = "storybook_science"


VISUAL_PLANNER_PROMPT = """You are an expert educational visual designer and scientific storyboard prompt writer for an AI video generation system.

Your task is to convert scene narration into a high-quality image generation prompt that creates a visually explanatory educational image.

CRITICAL RULE
The generated image MUST directly illustrate the specific concept described in the narration.
Do NOT generate generic decorative art prompts.
Do NOT produce irrelevant images (e.g., a random landscape when the narration is about photosynthesis).
Every element in the prompt MUST be traceable to something mentioned in the narration.

INPUT
Scene Heading: {heading}
Scene Narration: {narration}
Preferred Style Preset: {style_preset}

YOUR JOB
Carefully read the narration. Identify the EXACT subject, concept, process, or structure being described.
Then produce:
1. concept_summary — A 1-sentence summary of what the narration explains.
2. visual_type — e.g., "process diagram", "cross-section", "comparison chart", "labeled illustration".
3. enriched_image_prompt — A DETAILED prompt that will generate an image showing EXACTLY what the narration describes. This prompt MUST mention specific objects, structures, processes, or concepts from the narration. It must NOT be a generic prompt.
4. negative_prompt — Terms to avoid in generation.
5. optional_labels — Labels that should appear in the image.
6. optional_composition_notes — How to compose the image.

RULES
1. READ the narration carefully. Identify the specific subject (e.g., "chloroplast structure", "neural network layers", "water cycle", "supply chain management").
2. The enriched_image_prompt MUST include specific nouns and concepts from the narration — if the narration mentions "mitochondria" then the prompt must mention "mitochondria", not just "biology".
3. If the narration describes a process (how X works), show the process visually with arrows and steps.
4. If the narration describes a structure, show the structure with labeled parts.
5. If the narration makes a comparison, use split-screen or side-by-side composition.
6. Include relationships, arrows, flows, inputs, outputs, and labeled parts when useful.
7. NEVER produce vague prompts like "educational graphic", "beautiful illustration", "cinematic scene", or "animated introduction".
8. Use style only as enhancement. Never let style remove scientific clarity.
9. If the narration is abstract (e.g., about ethics, philosophy), create a concrete visual metaphor that teaches the concept.
10. Aim for visual clarity that a student can understand at a glance.

STYLE PRESET GUIDELINES
- ghibli_educational: warm, storybook-like, hand-painted feel, expressive but still clear and educational
- scientific_infographic: clean, labeled, diagrammatic, high clarity
- textbook_diagram: academic, simple background, strong labels, educational
- cinematic_educational: dramatic but concept-focused, visually rich
- minimalist_biology: clean, uncluttered, biology-focused explanatory image
- storybook_science: friendly and engaging for beginners

NEGATIVE PROMPT RULES
Include terms that reduce bad outputs such as:
- blurry, low detail, distorted anatomy, extra limbs, irrelevant objects, clutter, unreadable text, generic wallpaper, low educational value, messy composition, unrelated subject matter

OUTPUT FORMAT
Return strict JSON in this format:
{{
  "concept_summary": "...",
  "visual_type": "...",
  "enriched_image_prompt": "...",
  "negative_prompt": "...",
  "prompt_candidates": {{
     "scientific_diagram": "...",
     "educational_illustration": "...",
     "cinematic_educational": "..."
  }},
  "optional_labels": ["...", "..."],
  "optional_composition_notes": "..."
}}
"""

REWRITE_PROMPT_TEMPLATE = """You are an expert educational visual designer and scientific storyboard prompt writer for an AI video generation system.
Your task is to rewrite a vague image prompt into a highly specific, narration-grounded image generation prompt.

CRITICAL: The rewritten prompt MUST directly illustrate the specific concept described in the narration below.
Do NOT return a generic prompt. Every visual element must be traceable to the narration.

RULES:
- READ the narration carefully and identify the EXACT subject/concept
- The prompt must mention specific nouns and concepts from the narration
- Show the mechanism or process visually if the narration describes one
- Include important entities mentioned in the narration
- Include arrows showing relationships if needed
- Show inputs and outputs if relevant
- Use composition that teaches the concept
- NEVER use generic phrases: "educational graphic", "nice illustration", "cinematic scene", "animated background"
- Prefer scientific diagrams, educational illustrations, or concept explanations
- Ensure visual clarity — style must support learning

Original Vague Prompt: {prompt}
Scene Narration: {narration}

Return ONLY the rewritten prompt string. The prompt must reference specific concepts from the narration.
"""

class VisualPlannerService:
    @staticmethod
    def get_llm():
        return ChatGroq(
            api_key=settings.groq_api_key,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2
        )

    @staticmethod
    def get_json_llm():
        return ChatGroq(
            api_key=settings.groq_api_key,
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

    @staticmethod
    def validate_visual_prompt(prompt: str) -> bool:
        """Returns True if the prompt is valid and highly detailed, False if it's too vague/generic."""
        if not prompt or len(prompt.split()) < 15:  # Increased minimum word count
            logger.warning(f"Prompt too short ({len(prompt.split())} words): {prompt[:50]}")
            return False
            
        # Expanded list of banned generic phrases
        banned_phrases = [
            "educational graphic", "animation of", "nice illustration", 
            "background", "concept art", "simple diagram", "generic",
            "placeholder", "decorative", "abstract art", "wallpaper",
            "beautiful scene", "captivating", "animated introduction",
            "end card", "summary graphic", "bullet point", "infographic about",
            "visual representation", "image showing", "picture of"
        ]
        prompt_lower = prompt.lower()
        if any(phrase in prompt_lower for phrase in banned_phrases):
            logger.warning(f"Prompt contains banned phrase: {prompt[:50]}")
            return False
        
        # Require specific nouns/concepts (check for meaningful content words)
        # A good prompt should have multiple specific nouns
        words = prompt.split()
        # Filter out common words and check for specific terminology
        meaningful_words = [w for w in words if len(w) > 4 and w.lower() not in 
                          ['about', 'shows', 'image', 'scene', 'visual', 'illustration', 
                           'diagram', 'showing', 'depicting', 'represents']]
        
        if len(meaningful_words) < 8:  # Require at least 8 meaningful content words
            logger.warning(f"Prompt lacks specific terminology ({len(meaningful_words)} meaningful words): {prompt[:50]}")
            return False
            
        return True

    @classmethod
    async def rewrite_visual_prompt(cls, vague_prompt: str, narration: str) -> str:
        """Rewrites a vague prompt using the expert Groq LLM to make it educational and specific."""
        logger.info(f"Prompt failed validation, rewriting: '{vague_prompt}'")
        rewrite_template = PromptTemplate.from_template(REWRITE_PROMPT_TEMPLATE)
        chain = rewrite_template | cls.get_llm()
        res = chain.invoke({"prompt": vague_prompt, "narration": narration})
        rewritten = res.content.strip()
        logger.info(f"Rewritten prompt: '{rewritten}'")
        return rewritten

    @classmethod
    async def enrich_scene_visuals(cls, scene: SceneResponse, style_preset: str = StylePreset.CINEMATIC.value) -> VisualConceptResponse:
        """Analyzes a scene's narration and returns a rich visual prompt plan."""
        logger.info(f"Enriching visual prompt for Scene: {scene.scene_id} using style: {style_preset}")
        
        prompt = PromptTemplate.from_template(VISUAL_PLANNER_PROMPT)
        llm = cls.get_json_llm()
        
        chain = prompt | llm
        
        try:
            res = chain.invoke({
                "heading": scene.heading,
                "narration": scene.narration_text,
                "style_preset": style_preset
            })
            
            # Parse output - handle code blocks if LLM returns them
            content = res.content.strip()
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            data = json.loads(content)
            enriched_prompt = data.get("enriched_image_prompt", scene.visual_prompt)
            prompt_candidates = data.get("prompt_candidates", {})
            debug_logs = [f"Initial analysis generated: '{enriched_prompt[:50]}...'"]
            
            # Phase 5: Prompt Validation Stage
            if not cls.validate_visual_prompt(enriched_prompt):
                debug_logs.append(f"Validation FAILED for: '{enriched_prompt[:30]}...' (Too vague or restricted phrases found)")
                enriched_prompt = await cls.rewrite_visual_prompt(enriched_prompt, scene.narration_text)
                debug_logs.append(f"PROMPT REWRITTEN to: '{enriched_prompt[:50]}...'")
            else:
                debug_logs.append("Validation PASSED. Prompt is sufficiently descriptive.")

            return VisualConceptResponse(
                concept_summary=data.get("concept_summary", ""),
                visual_type=data.get("visual_type", ""),
                enriched_image_prompt=enriched_prompt,
                negative_prompt=data.get("negative_prompt", "blurry, generic"),
                prompt_candidates=prompt_candidates,
                debug_logs=debug_logs,
                optional_labels=data.get("optional_labels", []),
                optional_composition_notes=data.get("optional_composition_notes", "")
            )
            
        except Exception as e:
            logger.error(f"Failed to generate enriched visual plan: {e}")
            # Improved Fallback: Always use narration content to build a descriptive prompt
            # Extract first 200 chars of narration for context
            narration_snippet = scene.narration_text[:200].strip()
            fallback_prompt = (
                f"Educational illustration for a scene titled '{scene.heading}'. "
                f"The narration explains: {narration_snippet}. "
                f"Create a clear, detailed visual that directly illustrates these concepts. "
                f"Show specific objects, structures, or processes mentioned in the narration."
            )
            
            # Use scene.visual_prompt only if it's already narration-based (not generic)
            if scene.visual_prompt and len(scene.visual_prompt) > 50 and "narration discusses" in scene.visual_prompt.lower():
                fallback_prompt = scene.visual_prompt

            return VisualConceptResponse(
                concept_summary=f"Fallback: {scene.heading}",
                visual_type="Narration-based Educational",
                enriched_image_prompt=fallback_prompt,
                negative_prompt="blurry, distorted, unrelated subject matter, generic wallpaper, text-heavy, irrelevant objects",
                optional_labels=[],
                optional_composition_notes="Fallback prompt derived from scene narration content"
            )
