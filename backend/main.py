from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from questions import questions
from google import genai
from google.genai import types
from dotenv import load_dotenv
import os


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = None

if GEMINI_API_KEY:
    client = genai.Client(
        api_key=GEMINI_API_KEY
    )


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="AI Placement Mentor API",
    description="Backend API for AI Placement Mentor",
    version="2.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# REQUEST MODEL
# =========================================================

class MentorRequest(BaseModel):
    question: str


# =========================================================
# HOME
# =========================================================

@app.get("/")
def home():
    return {
        "message": "AI Placement Mentor Backend is Running",
        "genai_enabled": client is not None
    }


# =========================================================
# GET QUESTIONS
# =========================================================

@app.get("/questions")
def get_questions():

    return {
        "questions": questions,
        "total": len(questions)
    }


# =========================================================
# FIND RECOMMENDED QUESTIONS
# =========================================================

def get_recommended_questions(keyword):

    keyword = keyword.lower()

    recommended = []

    for item in questions:

        category = item.get(
            "category",
            ""
        ).lower()

        question_text = item.get(
            "question",
            ""
        ).lower()

        if (
            keyword in category
            or keyword in question_text
        ):

            recommended.append({
                "id": item.get("id"),
                "question": item.get("question"),
                "category": item.get("category"),
                "difficulty": item.get("difficulty")
            })

        # Maximum 5 recommendations
        if len(recommended) == 5:
            break

    return recommended


# =========================================================
# REAL GENAI AI MENTOR
# =========================================================

@app.post("/mentor")
def mentor(request: MentorRequest):

    user_question = request.question.strip()

    # -----------------------------------------------------
    # Empty question
    # -----------------------------------------------------

    if not user_question:

        return {
            "answer": "Please enter a question.",
            "recommended_questions": []
        }


    # -----------------------------------------------------
    # Check Gemini API configuration
    # -----------------------------------------------------

    if client is None:

        return {
            "answer": (
                "Gemini API is not configured. "
                "Please add GEMINI_API_KEY to your environment variables."
            ),
            "recommended_questions": []
        }


    # -----------------------------------------------------
    # SYSTEM INSTRUCTION
    # -----------------------------------------------------

    system_instruction = """
You are AI Placement Mentor.

You are an intelligent technical interview
and placement preparation assistant.

Your purpose is to help students prepare for:

- DSA
- Python
- Java
- JavaScript
- React
- FastAPI
- REST APIs
- SQL
- DBMS
- Operating Systems
- Computer Networks
- OOP
- Generative AI
- LLMs
- Prompt Engineering
- RAG
- Embeddings
- Vector Databases
- LangChain
- AI Agents
- Backend Development
- System Design
- Software Engineering Interviews

IMPORTANT RULES:

1. Explain concepts clearly.

2. Assume the student can be a beginner.

3. Use simple examples.

4. Give code examples when useful.

5. Explain code step-by-step.

6. For interview questions, provide an
   interview-ready explanation.

7. If the student asks a coding question,
   explain the approach before the code.

8. Keep answers practical and placement-focused.

9. Do not invent details about the student's
   project that were not provided.

10. If the student asks about Generative AI,
    explain both the concept and practical
    implementation where appropriate.

11. When explaining RAG, discuss:
    documents, chunking, embeddings,
    vector search, retrieval, context,
    and generation.

12. When explaining LLM applications,
    distinguish between:
    traditional rule-based logic and
    actual generative AI.
"""


    # -----------------------------------------------------
    # USER PROMPT
    # -----------------------------------------------------

    prompt = f"""
The student asked:

{user_question}

Answer as an AI Placement Mentor.

Give a useful, technically accurate,
beginner-friendly answer.

If this is an interview question,
also provide a short interview-ready answer.

If code is required, provide a small
working example and explain it.
"""


    # -----------------------------------------------------
    # CALL GEMINI
    # -----------------------------------------------------

    try:

        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.4,
                max_output_tokens=1000
            )
        )

        answer = response.text

        if not answer:

            answer = (
                "The AI model did not return a response. "
                "Please try again."
            )


    except Exception as error:

        print("Gemini API Error:", error)

        return {
            "answer": (
                "I could not generate an AI response right now. "
                "Please check the Gemini API configuration "
                "and try again."
            ),
            "recommended_questions": []
        }


    # =====================================================
    # FIND RELATED QUESTIONS
    # =====================================================

    recommended_questions = []

    question_lower = user_question.lower()

    topic_keywords = [
        ("dsa", "dsa"),
        ("data structure", "dsa"),
        ("algorithm", "dsa"),
        ("sql", "sql"),
        ("java", "java"),
        ("react", "react"),
        ("dbms", "dbms"),
        ("operating system", "operating systems"),
        (" os ", "operating systems"),
        ("network", "cn"),
        ("computer network", "cn"),
        ("cn", "cn"),
        ("oop", "oop"),
        ("python", "python"),
        ("fastapi", "fastapi"),
        ("rag", "rag"),
        ("ai", "ai"),
        ("llm", "ai")
    ]


    for keyword, topic in topic_keywords:

        if keyword in f" {question_lower} ":

            recommended_questions = (
                get_recommended_questions(topic)
            )

            if recommended_questions:
                break


    # =====================================================
    # RETURN RESPONSE
    # =====================================================

    return {
        "answer": answer.strip(),
        "recommended_questions": recommended_questions
    }
