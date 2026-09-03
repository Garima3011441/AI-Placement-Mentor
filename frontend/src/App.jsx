import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [difficulty, setDifficulty] = useState("All");

  // AI Mentor
  const [mentorQuestion, setMentorQuestion] = useState("");
  const [mentorAnswer, setMentorAnswer] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [recommendedQuestions, setRecommendedQuestions] = useState([]);

  // Completed questions
  const [completedQuestions, setCompletedQuestions] = useState(() => {
    const saved = localStorage.getItem("completedQuestions");
    return saved ? JSON.parse(saved) : [];
  });

  // Quiz
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [showQuizAnswer, setShowQuizAnswer] = useState(false);

  // Quiz results
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizSessionCompleted, setQuizSessionCompleted] = useState([]);

  // Fetch questions from backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/questions")
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions || []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
        setLoading(false);
      });
  }, []);

  // Save completed questions
  useEffect(() => {
    localStorage.setItem(
      "completedQuestions",
      JSON.stringify(completedQuestions)
    );
  }, [completedQuestions]);

  // Categories
  const categories = [
    "All",
    ...new Set(
      questions
        .map((question) => question.category)
        .filter(Boolean)
    ),
  ];

  // Filter questions
  const filteredQuestions = questions.filter((question) => {
    const questionText = (question.question || "").toLowerCase();
    const answerText = (question.answer || "").toLowerCase();

    const matchesSearch =
      questionText.includes(search.toLowerCase()) ||
      answerText.includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      question.category === category;

    const matchesDifficulty =
      difficulty === "All" ||
      question.difficulty === difficulty;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDifficulty
    );
  });

  // Mark question completed
  const toggleCompleted = (id) => {
    setCompletedQuestions((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (questionId) => questionId !== id
        );
      }

      return [...previous, id];
    });
  };

  // Mark completed in quiz
  const toggleQuizCompleted = (id) => {
    toggleCompleted(id);

    setQuizSessionCompleted((previous) => {
      if (previous.includes(id)) {
        return previous.filter(
          (questionId) => questionId !== id
        );
      }

      return [...previous, id];
    });
  };

  // Random question
  const showRandomQuestion = () => {
    if (filteredQuestions.length === 0) return;

    const randomIndex = Math.floor(
      Math.random() * filteredQuestions.length
    );

    const randomQuestion =
      filteredQuestions[randomIndex];

    setSelectedQuestion(randomQuestion.id);

    setTimeout(() => {
      document.getElementById(
        `question-${randomQuestion.id}`
      )?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  // Ask AI Mentor
  const askMentor = async () => {
    if (!mentorQuestion.trim()) return;

    setMentorLoading(true);
    setMentorAnswer("");
    setRecommendedQuestions([]);

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/mentor?question=${encodeURIComponent(
          mentorQuestion
        )}`
      );

      const data = await response.json();

      setMentorAnswer(data.answer || "");

      setRecommendedQuestions(
        data.recommended_questions || []
      );
    } catch (error) {
      console.error("Mentor error:", error);

      setMentorAnswer(
        "Unable to connect to the AI Mentor. Please make sure the backend is running."
      );
    }

    setMentorLoading(false);
  };

  // Start quiz
  const startQuiz = () => {
    if (filteredQuestions.length === 0) return;

    const shuffled = [...filteredQuestions]
      .sort(() => Math.random() - 0.5)
      .slice(
        0,
        Math.min(10, filteredQuestions.length)
      );

    setQuizQuestions(shuffled);
    setCurrentQuizIndex(0);
    setShowQuizAnswer(false);
    setQuizSessionCompleted([]);
    setQuizFinished(false);
    setQuizMode(true);
  };

  // Next quiz question
  const nextQuizQuestion = () => {
    if (
      currentQuizIndex <
      quizQuestions.length - 1
    ) {
      setCurrentQuizIndex(
        (previous) => previous + 1
      );

      setShowQuizAnswer(false);
    } else {
      setQuizMode(false);
      setQuizFinished(true);
      setShowQuizAnswer(false);
    }
  };

  // Exit quiz
  const exitQuiz = () => {
    setQuizMode(false);
    setQuizFinished(false);
    setQuizQuestions([]);
    setCurrentQuizIndex(0);
    setShowQuizAnswer(false);
    setQuizSessionCompleted([]);
  };

  // Overall progress
  const progressPercentage =
    questions.length > 0
      ? (
          (completedQuestions.length /
            questions.length) *
          100
        ).toFixed(1)
      : 0;

  // Category progress
  const categoryProgress = categories
    .filter((item) => item !== "All")
    .map((categoryName) => {
      const categoryQuestions =
        questions.filter(
          (question) =>
            question.category === categoryName
        );

      const completed =
        categoryQuestions.filter(
          (question) =>
            completedQuestions.includes(
              question.id
            )
        ).length;

      const percentage =
        categoryQuestions.length > 0
          ? (
              (completed /
                categoryQuestions.length) *
              100
            ).toFixed(0)
          : 0;

      return {
        category: categoryName,
        total: categoryQuestions.length,
        completed,
        percentage,
      };
    });

  // Quiz percentage
  const quizPercentage =
    quizQuestions.length > 0
      ? (
          (quizSessionCompleted.length /
            quizQuestions.length) *
          100
        ).toFixed(0)
      : 0;

  // ================= QUIZ RESULT =================

  if (quizFinished) {
    return (
      <div className="app">
        <div className="quiz-container">
          <div className="quiz-result-card">

            <h1>🏆 Quiz Completed!</h1>

            <p className="quiz-result-text">
              Great job! Here is your quiz
              session summary.
            </p>

            <div className="result-stat">
              <span>
                Questions in Quiz
              </span>

              <strong>
                {quizQuestions.length}
              </strong>
            </div>

            <div className="result-stat">
              <span>
                Questions Completed
              </span>

              <strong>
                {quizSessionCompleted.length}
              </strong>
            </div>

            <div className="result-stat">
              <span>
                Session Progress
              </span>

              <strong>
                {quizPercentage}%
              </strong>
            </div>

            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{
                  width: `${quizPercentage}%`,
                }}
              />
            </div>

            <div className="quiz-result-actions">
              <button onClick={startQuiz}>
                🎯 Start Another Quiz
              </button>

              <button onClick={exitQuiz}>
                ← Back to Dashboard
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ================= QUIZ MODE =================

  if (
    quizMode &&
    quizQuestions.length > 0
  ) {
    const currentQuestion =
      quizQuestions[currentQuizIndex];

    return (
      <div className="app">
        <div className="quiz-container">

          <div className="quiz-header">
            <div>
              <h1>🎯 Quiz Mode</h1>

              <p>
                Question{" "}
                {currentQuizIndex + 1} of{" "}
                {quizQuestions.length}
              </p>
            </div>

            <button onClick={exitQuiz}>
              Exit Quiz
            </button>
          </div>

          <div className="quiz-progress-bar">
            <div
              className="quiz-progress-fill"
              style={{
                width: `${
                  ((currentQuizIndex + 1) /
                    quizQuestions.length) *
                  100
                }%`,
              }}
            />
          </div>

          <div className="quiz-card">

            <p className="question-info">
              <strong>
                {currentQuestion.category}
              </strong>

              {" | "}

              {currentQuestion.difficulty}
            </p>

            <h2>
              {currentQuestion.question}
            </h2>

            {!showQuizAnswer && (
              <button
                onClick={() =>
                  setShowQuizAnswer(true)
                }
              >
                Show Answer
              </button>
            )}

            {showQuizAnswer && (
              <div className="question-answer">
                <strong>
                  Answer:
                </strong>

                <p>
                  {currentQuestion.answer}
                </p>
              </div>
            )}

            <div className="quiz-actions">

              <button
                className={
                  quizSessionCompleted.includes(
                    currentQuestion.id
                  )
                    ? "completed"
                    : ""
                }
                onClick={() =>
                  toggleQuizCompleted(
                    currentQuestion.id
                  )
                }
              >
                {quizSessionCompleted.includes(
                  currentQuestion.id
                )
                  ? "✓ Completed"
                  : "Mark as Completed"}
              </button>

              <button
                onClick={nextQuizQuestion}
              >
                {currentQuizIndex ===
                quizQuestions.length - 1
                  ? "Finish Quiz 🏆"
                  : "Next Question →"}
              </button>

            </div>

          </div>
        </div>
      </div>
    );
  }

  // ================= MAIN DASHBOARD =================

  return (
    <div className="app">

      {/* HEADER */}

      <div className="header">
        <h1>
          🤖 AI Placement Mentor
        </h1>

        <p>
          Practice interview questions,
          track your progress, and prepare
          for placements with your AI mentor.
        </p>
      </div>


      {/* QUIZ */}

      <div className="quiz-start-section">

        <div>
          <h2>
            🎯 Practice Quiz
          </h2>

          <p>
            Test yourself with 10 random
            interview questions.
          </p>
        </div>

        <button onClick={startQuiz}>
          Start Quiz
        </button>

      </div>


      {/* AI MENTOR */}

      <div className="card">

        <h2>
          🤖 Ask Your Placement Mentor
        </h2>

        <p>
          Ask questions about DSA, Java,
          React, SQL, DBMS, Operating
          Systems, OOP, projects, or
          interview preparation.
        </p>

        <textarea
          className="mentor-input"
          value={mentorQuestion}
          onChange={(event) =>
            setMentorQuestion(
              event.target.value
            )
          }
          placeholder="Example: Help me prepare for React interviews"
        />

        <br />

        <button
          onClick={askMentor}
          disabled={mentorLoading}
        >
          {mentorLoading
            ? "Thinking..."
            : "Ask Mentor"}
        </button>


        {/* MENTOR ANSWER */}

        {mentorAnswer && (
          <div className="answer-box">

            <h3>
              🤖 Mentor Answer
            </h3>

            <p>
              {mentorAnswer}
            </p>


            {/* RECOMMENDED QUESTIONS */}

            {recommendedQuestions.length >
              0 && (
              <div className="recommended-section">

                <h3>
                  📚 Recommended Questions
                </h3>

                <p>
                  Practice these questions
                  based on your topic:
                </p>

                {recommendedQuestions.map(
                  (item) => (
                    <div
                      className="recommended-question"
                      key={item.id}
                    >

                      <h4>
                        {item.id}.{" "}
                        {item.question}
                      </h4>

                      <p>
                        <strong>
                          {item.category}
                        </strong>

                        {" | "}

                        {item.difficulty}
                      </p>

                      <button
                        onClick={() => {
                          setSelectedQuestion(
                            item.id
                          );

                          document
                            .getElementById(
                              `question-${item.id}`
                            )
                            ?.scrollIntoView({
                              behavior:
                                "smooth",
                              block:
                                "center",
                            });
                        }}
                      >
                        Practice Question
                      </button>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        )}

      </div>


      {/* OVERALL PROGRESS */}

      <div className="card">

        <h2>
          📊 Overall Progress
        </h2>

        <p>
          Questions Completed:{" "}

          <strong>
            {completedQuestions.length}
            {" / "}
            {questions.length}
          </strong>
        </p>

        <p>
          Progress:{" "}

          <strong>
            {progressPercentage}%
          </strong>
        </p>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{
              width:
                `${progressPercentage}%`,
            }}
          />

        </div>

      </div>


      {/* CATEGORY PROGRESS */}

      <div className="card">

        <h2>
          📚 Category Progress
        </h2>

        <div className="category-dashboard">

          {categoryProgress.map(
            (item) => (
              <div
                className="category-card"
                key={item.category}
              >

                <h3>
                  {item.category}
                </h3>

                <p>
                  <strong>
                    {item.completed}
                    {" / "}
                    {item.total}
                  </strong>

                  {" "}Completed
                </p>

                <div className="category-progress-bar">

                  <div
                    className="category-progress-fill"
                    style={{
                      width:
                        `${item.percentage}%`,
                    }}
                  />

                </div>

                <p className="percentage-text">
                  {item.percentage}%
                </p>

              </div>
            )
          )}

        </div>

      </div>


      {/* FILTERS */}

      <div className="filters">

        <input
          className="search-input"
          type="text"
          placeholder="🔍 Search questions..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <select
          className="select-input"
          value={category}
          onChange={(event) =>
            setCategory(
              event.target.value
            )
          }
        >
          {categories.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>


        <select
          className="select-input"
          value={difficulty}
          onChange={(event) =>
            setDifficulty(
              event.target.value
            )
          }
        >
          <option value="All">
            All Difficulties
          </option>

          <option value="Easy">
            Easy
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Hard">
            Hard
          </option>
        </select>


        <button
          onClick={showRandomQuestion}
        >
          🎲 Random Question
        </button>

        <button onClick={startQuiz}>
          🎯 Start Quiz
        </button>

      </div>


      {/* QUESTIONS */}

      <h2>
        Interview Questions (
        {filteredQuestions.length}
        )
      </h2>


      {loading && (
        <p>
          Loading questions...
        </p>
      )}


      {!loading &&
        filteredQuestions.map(
          (item) => (

            <div
              className="question-card"
              id={`question-${item.id}`}
              key={item.id}
            >

              <h3>
                {item.id}.{" "}
                {item.question}
              </h3>

              <p className="question-info">

                <strong>
                  {item.category}
                </strong>

                {" | "}

                {item.difficulty}

              </p>


              <div className="question-actions">

                <button
                  onClick={() =>
                    setSelectedQuestion(
                      selectedQuestion ===
                        item.id
                        ? null
                        : item.id
                    )
                  }
                >
                  {selectedQuestion ===
                  item.id
                    ? "Hide Answer"
                    : "Show Answer"}
                </button>


                <button
                  className={
                    completedQuestions.includes(
                      item.id
                    )
                      ? "completed"
                      : ""
                  }
                  onClick={() =>
                    toggleCompleted(
                      item.id
                    )
                  }
                >
                  {completedQuestions.includes(
                    item.id
                  )
                    ? "✓ Completed"
                    : "Mark as Completed"}
                </button>

              </div>


              {selectedQuestion ===
                item.id && (

                <div className="question-answer">

                  <strong>
                    Answer:
                  </strong>

                  <p>
                    {item.answer}
                  </p>

                </div>

              )}

            </div>
          )
        )}


      {!loading &&
        filteredQuestions.length === 0 && (
          <p>
            No questions found.
          </p>
        )}

    </div>
  );
}

export default App;