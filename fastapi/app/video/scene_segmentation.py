import uuid
import re
from typing import List

from app.models.schemas import ScriptResponse
from app.models.video_schemas import SceneResponse, ProjectMetadata


class SceneSegmentationService:
    """
    Transforms a generated ScriptResponse (Phase 1) into discrete, 
    renderable video Scene objects (Phase 2).
    
    Rather than calling an LLM again, this deterministically maps the highly 
    structured sections of the RAG script output into scenes.
    Visual prompts are derived directly from the narration content so that
    generated images are always relevant to what the scene is about.
    """

    # Words that add no visual meaning – stripped when building prompts
    _STOPWORDS = {
        "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
        "have", "has", "had", "do", "does", "did", "will", "would", "shall",
        "should", "may", "might", "must", "can", "could", "to", "of", "in",
        "for", "on", "with", "at", "by", "from", "as", "into", "through",
        "during", "before", "after", "above", "below", "between", "out",
        "off", "over", "under", "again", "further", "then", "once", "that",
        "this", "these", "those", "it", "its", "we", "our", "you", "your",
        "they", "their", "them", "he", "she", "him", "her", "his", "not",
        "but", "and", "or", "nor", "so", "if", "than", "too", "very",
        "just", "about", "also", "more", "most", "some", "any", "each",
        "every", "all", "both", "few", "many", "much", "own", "other",
        "such", "no", "only", "same", "now", "let", "look", "see",
        "well", "way", "even", "new", "want", "because", "here", "there",
        "when", "who", "which", "how", "what", "where", "why", "up",
    }

    @staticmethod
    def _estimate_duration(text: str, wpm: int = 150) -> float:
        """Estimate speech duration based on a standard words-per-minute rate."""
        if not text:
            return 0.0
        words = len(text.split())
        words_per_second = wpm / 60.0
        return round(words / words_per_second, 1)

    @classmethod
    def _extract_key_concepts(cls, text: str, max_words: int = 25) -> str:
        """
        Extract the most meaningful words/phrases from a narration text.
        Returns a compact string of key concepts (up to max_words).
        """
        if not text:
            return ""
        # Remove filler phrases and clean up
        cleaned = re.sub(r"[\"'()\[\]{};:!?]", " ", text)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        
        words = cleaned.split()
        # Keep meaningful words in order (preserves natural phrasing)
        meaningful = [w for w in words if w.lower() not in cls._STOPWORDS and len(w) > 2]
        return " ".join(meaningful[:max_words])

    @classmethod
    def _build_visual_prompt_from_narration(
        cls, heading: str, narration: str, hint: str = ""
    ) -> str:
        """
        Build a scene-specific visual prompt grounded in the actual narration.
        
        CRITICAL: The prompt MUST be specific and directly illustrate the narration content.
        Every visual element must be traceable to the narration.
        
        Priority:
          1. If a non-generic hint exists (e.g. from suggested_visuals), use it
             combined with narration context.
          2. Otherwise, extract key concepts from the narration itself.
        """
        # Detect generic / useless hints
        generic_patterns = [
            "captivating", "cinematic opening", "animated introduction",
            "end card", "summary graphic", "bullet point list",
            "infographic about", "educational graphic",
            "generic", "placeholder", "visual representation",
            "image showing", "picture of", "scene depicting"
        ]
        hint_is_generic = (
            not hint
            or not hint.strip()
            or len(hint.split()) < 5
            or any(g in hint.lower() for g in generic_patterns)
        )

        key_concepts = cls._extract_key_concepts(narration, max_words=30)
        
        if not key_concepts:
            # Absolute fallback – use heading with more specificity
            return (
                f"Detailed educational illustration that clearly explains and visually demonstrates "
                f"the specific concept of '{heading}'. Show the main subject, its components, "
                f"and how it works or relates to the topic. Include visual elements that make "
                f"the concept immediately understandable to students."
            )

        if hint_is_generic:
            # Build entirely from narration with enhanced specificity
            visual_prompt = (
                f"Create a detailed educational illustration for the video scene titled '{heading}'. "
                f"The narration explains: {narration[:200]}. "
                f"Key concepts to visualize: {key_concepts}. "
                f"CRITICAL: Show these specific concepts visually with clear, relevant elements. "
                f"If the narration describes a process, show the process steps with arrows. "
                f"If it describes a structure, show the structure with labeled parts. "
                f"If it describes a comparison, use side-by-side composition. "
                f"The image must directly illustrate what the narration is explaining, "
                f"not generic decorative art."
            )
        else:
            # Combine the LLM-suggested hint with narration context
            visual_prompt = (
                f"{hint}. "
                f"The narration specifically discusses: {narration[:150]}. "
                f"Key concepts from narration: {key_concepts}. "
                f"CRITICAL: Ensure the image directly illustrates these specific concepts. "
                f"Every visual element must relate to what the narration is explaining. "
                f"Show the actual subject matter, not abstract or generic imagery."
            )

        return visual_prompt

    @classmethod
    def segment_script(cls, project_id: str, script: ScriptResponse) -> ProjectMetadata:
        """Convert a full video script into a series of independently renderable scenes."""
        scenes: List[SceneResponse] = []
        scene_counter = 1

        def add_scene(heading: str, narration: str, visual_hint: str = ""):
            nonlocal scene_counter
            if not narration.strip():
                return

            # Always build the visual prompt from the narration content
            visual = cls._build_visual_prompt_from_narration(
                heading=heading,
                narration=narration,
                hint=visual_hint,
            )

            scene = SceneResponse(
                scene_id=f"{project_id}_scene_{scene_counter:03d}_{uuid.uuid4().hex[:6]}",
                project_id=project_id,
                scene_order=scene_counter,
                heading=heading,
                narration_text=narration,
                visual_prompt=visual,
                subtitle_text=narration,
                estimated_duration=cls._estimate_duration(narration)
            )
            scenes.append(scene)
            scene_counter += 1

        # 1. Hook – use first visual_cue if available as a hint
        if script.hook:
            hook_hint = script.visual_cues[0] if script.visual_cues else ""
            add_scene(
                heading="Hook",
                narration=script.hook,
                visual_hint=hook_hint,
            )

        # 2. Introduction
        if script.introduction:
            add_scene(
                heading="Introduction",
                narration=script.introduction,
                visual_hint="",  # derive entirely from narration
            )

        # 3. Main Sections – use suggested_visuals as hints
        for section in script.main_sections:
            hint = section.suggested_visuals[0] if section.suggested_visuals else ""
            add_scene(
                heading=section.heading,
                narration=section.narration,
                visual_hint=hint,
            )

        # 4. Conclusion
        if script.conclusion:
            add_scene(
                heading="Conclusion",
                narration=script.conclusion,
                visual_hint="",
            )

        # 5. Takeaways
        if script.key_takeaways:
            takeaways_text = "Key takeaways: " + ". ".join(script.key_takeaways)
            add_scene(
                heading="Key Takeaways",
                narration=takeaways_text,
                visual_hint="",
            )

        # Build project metadata tracker
        return ProjectMetadata(
            project_id=project_id,
            total_scenes=len(scenes),
            scenes=scenes,
        )


# Create singleton instance
segmenter = SceneSegmentationService()
