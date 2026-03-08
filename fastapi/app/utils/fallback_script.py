"""
Fallback/dummy script generator for when script generation fails.
Provides a default AI-themed educational script.
"""

from datetime import datetime
from app.models.schemas import ScriptResponse, ScriptSection


# Constant dummy transcript - used as fallback everywhere
DUMMY_TRANSCRIPT = """Scene 1: Imagine having a personal assistant that can change the TV channel, adjust the fan speed, and even clean your home. Sounds like science fiction, right? But with Artificial Intelligence, it's becoming a reality.

Scene 2: Artificial Intelligence, or AI, is revolutionizing the way we live and interact with technology. From expert systems to natural language processing, AI is becoming an integral part of our daily lives. But have you ever wondered how AI is affecting our human psychology?

Scene 3: Artificial Intelligence is a broad field that encompasses expert systems, natural language processing, and machine vision. It's used in various applications, such as facial detection, text editors, and auto-correct features. AI is becoming an essential part of our lives, and its impact on human psychology is significant.

Scene 4: AI can help us to complete tasks more efficiently and quickly. It can also help us to minimize costs by reducing the need for expert help. Additionally, AI can assist us in proofreading and avoiding grammatical errors. With AI, we can work smarter, not harder.

Scene 5: While AI has many benefits, it also has some negative effects on human psychology. For example, the increased use of AI can lead to a lack of creativity and a sense of dependency on technology. Additionally, there is a risk of ultimate unemployment in the future, which can have significant psychological impacts. However, AI can also be used to improve mental health and well-being, such as through personalized treatment plans and predictive analytics.

Scene 6: In conclusion, Artificial Intelligence is a powerful technology that is changing the way we live and interact with the world. While it has many benefits, it also has some negative effects on human psychology. As we move forward, it's essential to consider the potential impacts of AI on our mental health and well-being, and to use this technology in a way that benefits society as a whole.

Scene 7: Key takeaways: Artificial Intelligence is a broad field that encompasses expert systems, natural language processing, and machine vision. AI can have both positive and negative effects on human psychology. It's essential to consider the potential impacts of AI on our mental health and well-being."""


def get_dummy_transcript() -> str:
    """
    Get the constant dummy transcript.
    This transcript is used as a fallback throughout the system.
    """
    return DUMMY_TRANSCRIPT


def generate_fallback_script(document_id: str = "fallback") -> ScriptResponse:
    """
    Generate a fallback script about Artificial Intelligence and Human Psychology.
    This is used when the actual script generation fails or as a demo/preview.
    """
    
    main_sections = [
        ScriptSection(
            heading="What is Artificial Intelligence?",
            summary="Introduction to AI and its applications in daily life",
            narration="Artificial Intelligence is a broad field that encompasses expert systems, natural language processing, and machine vision. It's used in various applications, such as facial detection, text editors, and auto-correct features. AI is becoming an essential part of our lives, and its impact on human psychology is significant.",
            suggested_visuals=[
                "Diagram showing AI components: expert systems, NLP, machine vision",
                "Examples of AI in daily life: smartphones, smart homes, assistants"
            ],
            source_chunk_ids=[]
        ),
        ScriptSection(
            heading="Positive Effects of AI",
            summary="How AI helps us work more efficiently",
            narration="AI can help us to complete tasks more efficiently and quickly. It can also help us to minimize costs by reducing the need for expert help. Additionally, AI can assist us in proofreading and avoiding grammatical errors. With AI, we can work smarter, not harder.",
            suggested_visuals=[
                "Infographic showing efficiency gains with AI",
                "Comparison: tasks with AI vs without AI"
            ],
            source_chunk_ids=[]
        ),
        ScriptSection(
            heading="Negative Effects and Concerns",
            summary="Potential psychological impacts of AI dependency",
            narration="While AI has many benefits, it also has some negative effects on human psychology. For example, the increased use of AI can lead to a lack of creativity and a sense of dependency on technology. Additionally, there is a risk of ultimate unemployment in the future, which can have significant psychological impacts. However, AI can also be used to improve mental health and well-being, such as through personalized treatment plans and predictive analytics.",
            suggested_visuals=[
                "Split-screen: benefits vs concerns of AI",
                "Graph showing AI impact on employment and creativity"
            ],
            source_chunk_ids=[]
        )
    ]
    
    return ScriptResponse(
        document_id=document_id,
        title="Artificial Intelligence and Human Psychology",
        target_audience="general audience interested in AI and psychology",
        estimated_duration="3-4 minutes",
        hook="Imagine having a personal assistant that can change the TV channel, adjust the fan speed, and even clean your home. Sounds like science fiction, right? But with Artificial Intelligence, it's becoming a reality.",
        introduction="Artificial Intelligence, or AI, is revolutionizing the way we live and interact with technology. From expert systems to natural language processing, AI is becoming an integral part of our daily lives. But have you ever wondered how AI is affecting our human psychology?",
        main_sections=main_sections,
        conclusion="In conclusion, Artificial Intelligence is a powerful technology that is changing the way we live and interact with the world. While it has many benefits, it also has some negative effects on human psychology. As we move forward, it's essential to consider the potential impacts of AI on our mental health and well-being, and to use this technology in a way that benefits society as a whole.",
        key_takeaways=[
            "Artificial Intelligence is a broad field that encompasses expert systems, natural language processing, and machine vision",
            "AI can have both positive and negative effects on human psychology",
            "It's essential to consider the potential impacts of AI on our mental health and well-being"
        ],
        narration_script=DUMMY_TRANSCRIPT,
        visual_cues=[
            "Opening: Smart home devices responding to voice commands",
            "AI brain visualization with neural networks",
            "Diagram of AI components and applications",
            "Person working efficiently with AI assistance",
            "Split-screen showing AI benefits and concerns",
            "Futuristic cityscape with AI integration",
            "Key points displayed as animated text"
        ],
        source_coverage_notes="This is a fallback/demo script about Artificial Intelligence and Human Psychology. It covers the basics of AI, its applications, positive and negative effects on human psychology, and key considerations for the future.",
        generated_at=datetime.utcnow()
    )
