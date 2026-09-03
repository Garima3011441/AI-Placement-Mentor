from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from questions import questions

app = FastAPI(
    title="AI Placement Mentor API",
    description="Backend API for AI Placement Mentor",
    version="1.0"
)

# CORS
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


# ---------------- HOME ----------------

@app.get("/")
def home():
    return {
        "message": "AI Placement Mentor Backend is Running"
    }


# ---------------- GET QUESTIONS ----------------

@app.get("/questions")
def get_questions():
    return {
        "questions": questions,
        "total": len(questions)
    }


# ---------------- FIND RECOMMENDED QUESTIONS ----------------

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

        # Return maximum 5 recommendations
        if len(recommended) == 5:
            break

    return recommended


# ---------------- AI MENTOR ----------------

@app.get("/mentor")
def mentor(question: str):

    user_question = question.lower()

    topic = None
    answer = ""


    # -------- REACT --------

    if "react" in user_question:

        topic = "react"

        answer = """
For React interview preparation, focus on:

1. Components and JSX
2. Props and State
3. useState
4. useEffect
5. Hooks
6. Virtual DOM
7. Controlled Components
8. Context API
9. API calls
10. Project architecture

For interviews, explain where you used React concepts in your AI Placement Mentor project.
"""


    # -------- DSA --------

    elif (
        "dsa" in user_question
        or "data structure" in user_question
        or "algorithm" in user_question
    ):

        topic = "dsa"

        answer = """
For DSA preparation, focus on problem-solving patterns.

Important topics:

1. Arrays
2. Strings
3. Linked Lists
4. Stack
5. Queue
6. Recursion
7. Binary Search
8. Trees
9. Graphs
10. Dynamic Programming

In interviews, first explain the brute-force approach and then optimize it.
"""


    # -------- SQL --------

    elif "sql" in user_question:

        topic = "sql"

        answer = """
For SQL interviews, focus on:

1. SELECT and WHERE
2. GROUP BY
3. HAVING
4. JOINS
5. Subqueries
6. Aggregate Functions
7. Window Functions
8. Keys
9. Normalization
10. Indexes

Practice writing queries independently.
"""


    # -------- JAVA --------

    elif "java" in user_question:

        topic = "java"

        answer = """
For Java interviews, focus on:

1. OOP principles
2. Classes and Objects
3. Inheritance
4. Polymorphism
5. Abstraction
6. Encapsulation
7. Exception Handling
8. Collections Framework
9. Multithreading
10. JVM, JRE and JDK

Prepare practical examples for every important concept.
"""


    # -------- DBMS --------

    elif "dbms" in user_question:

        topic = "dbms"

        answer = """
For DBMS interviews, focus on:

1. DBMS vs RDBMS
2. Primary and Foreign Keys
3. Normalization
4. ACID Properties
5. Transactions
6. Indexing
7. Joins
8. ER Diagrams
9. Concurrency Control
10. SQL Queries
"""


    # -------- OPERATING SYSTEMS --------

    elif (
        "operating system" in user_question
        or "os" in user_question
    ):

        topic = "operating systems"

        answer = """
For Operating Systems interviews, focus on:

1. Process
2. Thread
3. Process Scheduling
4. Context Switching
5. Deadlock
6. Paging
7. Segmentation
8. Virtual Memory
9. Synchronization
10. CPU Scheduling Algorithms
"""


    # -------- INTERVIEW / PLACEMENT --------

    elif (
        "interview" in user_question
        or "placement" in user_question
    ):

        answer = """
For placement preparation, focus on four major areas:

1. DSA
2. Core CS subjects
3. Projects
4. HR questions

For your projects, always be prepared to explain:

• Why you built it
• Technologies used
• Architecture
• API communication
• Challenges
• Your contribution
"""


    # -------- DEFAULT --------

    else:

        answer = """
As your AI Placement Mentor, I recommend:

1. Understand the concept.
2. Learn why it is used.
3. Practice with examples.
4. Connect it to your project.
5. Practice explaining it in interview language.

Ask me about DSA, Java, React, SQL, DBMS,
Operating Systems, OOP, projects, or placements.
"""


    # Get questions related to topic
    recommended_questions = []

    if topic:
        recommended_questions = (
            get_recommended_questions(topic)
        )


    return {
        "answer": answer.strip(),
        "recommended_questions": recommended_questions
    }