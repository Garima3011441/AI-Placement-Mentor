import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "https://ai-placement-mentor-fy6x.onrender.com";

const subjects = [
  { name: "DSA", score: 72 },
  { name: "DBMS", score: 85 },
  { name: "Operating Systems", score: 43 },
  { name: "Computer Networks", score: 38 },
  { name: "OOP", score: 76 },
  { name: "Aptitude", score: 82 },
];

const assessmentSubjects = [
  "DSA",
  "DBMS",
  "OS",
  "CN",
  "OOP",
  "Aptitude",
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  // Assessment states
  const [selectedSubject, setSelectedSubject] = useState("DSA");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // AI Mentor states
  const [mentorQuestion, setMentorQuestion] = useState("");
  const [mentorAnswer, setMentorAnswer] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);

  useEffect(() => {
    if (activePage === "Assessment") {
      loadQuestions(selectedSubject);
    }
  }, [activePage]);

  async function loadQuestions(subject) {
    setLoading(true);
    setResult(null);
    setAnswers({});

    try {
      const response = await fetch(
        `${API_URL}/questions/${subject}`
      );

      if (!response.ok) {
        throw new Error("Failed to load questions");
      }

      const data = await response.json();

      setQuestions(data.questions || []);
    } catch (error) {
      console.error(error);
      setQuestions([]);
    }

    setLoading(false);
  }

  function changeSubject(subject) {
    setSelectedSubject(subject);
    loadQuestions(subject);
  }

  function selectAnswer(questionId, optionIndex) {
    setAnswers({
      ...answers,
      [questionId]: optionIndex,
    });
  }

  async function submitAssessment() {
    if (questions.length === 0) {
      return;
    }

    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/assessment/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            subject: selectedSubject,
            answers: answers,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Assessment submission failed");
      }

      const data = await response.json();

      setResult(data);
    } catch (error) {
      console.error(error);
      alert("Could not connect to backend.");
    }
  }

  // =========================
  // AI MENTOR
  // =========================

  async function askMentor() {
    if (!mentorQuestion.trim()) {
      return;
    }

    setMentorLoading(true);
    setMentorAnswer("");

    try {
      const response = await fetch(
        `${API_URL}/mentor`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: mentorQuestion,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Backend request failed");
      }

      const data = await response.json();

      setMentorAnswer(data.answer);
    } catch (error) {
      console.error(error);

      setMentorAnswer(
        "Unable to connect to the AI Mentor backend. Please try again."
      );
    }

    setMentorLoading(false);
  }

  function handleMentorKeyDown(event) {
    if (event.key === "Enter") {
      askMentor();
    }
  }

  function renderDashboard() {
    return (
      <>
        <section className="welcome-card">
          <div>
            <h2>Welcome back! 👋</h2>

            <p>
              Track your placement preparation and improve your weak areas.
            </p>

            <button
              className="primary-button"
              onClick={() => setActivePage("Assessment")}
            >
              Take Assessment
            </button>
          </div>

          <div className="overall-score">
            <span>Overall Score</span>
            <strong>66%</strong>
          </div>
        </section>

        <h2 className="section-title">Your Performance</h2>

        <section className="subject-grid">
          {subjects.map((subject) => (
            <div className="subject-card" key={subject.name}>
              <div className="subject-header">
                <span>{subject.name}</span>

                <strong>{subject.score}%</strong>
              </div>

              <div className="progress-background">
                <div
                  className="progress"
                  style={{
                    width: `${subject.score}%`,
                  }}
                ></div>
              </div>

              <p>
                {subject.score < 50
                  ? "Needs improvement"
                  : subject.score < 75
                  ? "Keep practicing"
                  : "Good performance"}
              </p>
            </div>
          ))}
        </section>

        <section className="bottom-grid">
          <div className="panel">
            <h2>Recommended Focus</h2>

            <div className="recommendation">
              <span>Computer Networks</span>
              <strong>High Priority</strong>
            </div>

            <div className="recommendation">
              <span>Operating Systems</span>
              <strong>High Priority</strong>
            </div>

            <div className="recommendation">
              <span>DSA</span>
              <strong>Medium Priority</strong>
            </div>
          </div>

          <div className="panel">
            <h2>Quick Actions</h2>

            <button
              className="action-button"
              onClick={() => setActivePage("Assessment")}
            >
              📝 Start Assessment
            </button>

            <button
              className="action-button"
              onClick={() => setActivePage("AI Mentor")}
            >
              🤖 Ask AI Mentor
            </button>

            <button
              className="action-button"
              onClick={() => setActivePage("Resume")}
            >
              📄 Analyze Resume
            </button>
          </div>
        </section>
      </>
    );
  }

  function renderAssessment() {
    return (
      <section className="assessment-page">
        <div className="panel">
          <h2>Take Assessment</h2>

          <p className="description">
            Select a subject and answer all questions.
          </p>

          <div className="subject-selector">
            {assessmentSubjects.map((subject) => (
              <button
                key={subject}
                className={
                  selectedSubject === subject
                    ? "subject-button selected"
                    : "subject-button"
                }
                onClick={() => changeSubject(subject)}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div className="panel">
            <h3>Loading questions...</h3>
          </div>
        )}

        {!loading && questions.length > 0 && (
          <div className="questions-container">
            {questions.map((question, index) => (
              <div
                className="question-card"
                key={question.id}
              >
                <h3>
                  {index + 1}. {question.question}
                </h3>

                <div className="options">
                  {question.options.map(
                    (option, optionIndex) => (
                      <label
                        className="option"
                        key={optionIndex}
                      >
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          checked={
                            answers[question.id] ===
                            optionIndex
                          }
                          onChange={() =>
                            selectAnswer(
                              question.id,
                              optionIndex
                            )
                          }
                        />

                        <span>{option}</span>
                      </label>
                    )
                  )}
                </div>
              </div>
            ))}

            <button
              className="submit-button"
              onClick={submitAssessment}
            >
              Submit Assessment
            </button>
          </div>
        )}

        {!loading && questions.length === 0 && (
          <div className="panel">
            <h3>No questions available.</h3>
            <p>Please check the backend connection.</p>
          </div>
        )}

        {result && (
          <div className="result-card">
            <h2>Assessment Complete 🎉</h2>

            <div className="result-score">
              {result.score}%
            </div>

            <p>
              You answered{" "}
              <strong>{result.correct}</strong> out of{" "}
              <strong>{result.total}</strong> questions correctly.
            </p>

            <button
              className="primary-button"
              onClick={() =>
                setActivePage("Dashboard")
              }
            >
              Back to Dashboard
            </button>
          </div>
        )}
      </section>
    );
  }

  // =========================
  // AI MENTOR PAGE
  // =========================

  function renderMentor() {
    return (
      <section className="mentor-page">
        <div className="mentor-card">
          <div className="mentor-icon">
            🤖
          </div>

          <h2>AI Mentor</h2>

          <p className="mentor-description">
            Ask questions about DSA, DBMS, OS, CN, OOP,
            Aptitude, or placements.
          </p>

          <div className="mentor-chat">
            <div className="mentor-message">
              <strong>AI Mentor</strong>

              <p>
                Hi! I'm your placement mentor.
                What would you like to learn today?
              </p>
            </div>

            {mentorAnswer && (
              <div className="mentor-answer">
                <strong>🤖 Mentor Response</strong>

                <p>{mentorAnswer}</p>
              </div>
            )}

            {mentorLoading && (
              <div className="mentor-loading">
                Thinking...
              </div>
            )}
          </div>

          <div className="mentor-input-container">
            <input
              type="text"
              placeholder="Ask your placement question..."
              value={mentorQuestion}
              onChange={(event) =>
                setMentorQuestion(event.target.value)
              }
              onKeyDown={handleMentorKeyDown}
            />

            <button
              className="mentor-send-button"
              onClick={askMentor}
              disabled={mentorLoading}
            >
              {mentorLoading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </section>
    );
  }

  function renderStudyPlan() {
    return (
      <section className="study-plan-page">
        <h2>Your Personalized Study Plan 📚</h2>

        <p>
          Focus more on your weaker subjects and maintain
          your strong areas.
        </p>

        <div className="study-grid">
          <div className="study-card high">
            <span>🔴 High Priority</span>

            <h2>Computer Networks</h2>

            <p>Current Score: 38%</p>

            <strong>Study 2 hours/day</strong>

            <ul>
              <li>OSI Model</li>
              <li>TCP/IP</li>
              <li>Routing</li>
              <li>Network Security</li>
            </ul>
          </div>

          <div className="study-card high">
            <span>🔴 High Priority</span>

            <h2>Operating Systems</h2>

            <p>Current Score: 43%</p>

            <strong>Study 2 hours/day</strong>

            <ul>
              <li>Processes & Threads</li>
              <li>CPU Scheduling</li>
              <li>Deadlocks</li>
              <li>Memory Management</li>
            </ul>
          </div>

          <div className="study-card medium">
            <span>🟡 Medium Priority</span>

            <h2>DSA</h2>

            <p>Current Score: 72%</p>

            <strong>Study 1.5 hours/day</strong>

            <ul>
              <li>Arrays</li>
              <li>Strings</li>
              <li>Binary Search</li>
              <li>Linked Lists</li>
            </ul>
          </div>

          <div className="study-card maintain">
            <span>🟢 Maintain</span>

            <h2>DBMS</h2>

            <p>Current Score: 85%</p>

            <strong>Study 30 minutes/day</strong>

            <ul>
              <li>SQL</li>
              <li>Joins</li>
              <li>Normalization</li>
              <li>Transactions</li>
            </ul>
          </div>
        </div>

        <div className="today-plan">
          <h2>Today's Plan 🎯</h2>

          <div>
            <strong>1. Computer Networks</strong>
            <p>Study OSI Model — 45 minutes</p>
          </div>

          <div>
            <strong>2. Operating Systems</strong>
            <p>Practice CPU Scheduling — 45 minutes</p>
          </div>

          <div>
            <strong>3. DSA</strong>
            <p>Solve 3 Binary Search problems — 60 minutes</p>
          </div>

          <div>
            <strong>4. DBMS</strong>
            <p>Practice SQL — 30 minutes</p>
          </div>
        </div>
      </section>
    );
  }

  function renderOtherPage() {
    return (
      <section className="coming-soon">
        <h2>{activePage}</h2>

        <p>This module will be built next.</p>
      </section>
    );
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>AI Mentor</h2>

        <button
          className={
            activePage === "Dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("Dashboard")
          }
        >
          🏠 Dashboard
        </button>

        <button
          className={
            activePage === "Assessment"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("Assessment")
          }
        >
          📝 Assessment
        </button>

        <button
          className={
            activePage === "Study Plan"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("Study Plan")
          }
        >
          📚 Study Plan
        </button>

        <button
          className={
            activePage === "AI Mentor"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("AI Mentor")
          }
        >
          🤖 AI Mentor
        </button>

        <button
          className={
            activePage === "Resume"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("Resume")
          }
        >
          📄 Resume Analysis
        </button>

        <button
          className={
            activePage === "Interview"
              ? "active"
              : ""
          }
          onClick={() =>
            setActivePage("Interview")
          }
        >
          🎯 Interview Prep
        </button>
      </aside>

      <main className="main">
        <header>
          <div>
            <h1>{activePage}</h1>

            <p>
              Personalized placement preparation platform
            </p>
          </div>

          <div className="profile">
            <div className="avatar">G</div>

            <span>Student</span>
          </div>
        </header>

        {activePage === "Dashboard" &&
          renderDashboard()}

        {activePage === "Assessment" &&
          renderAssessment()}

        {activePage === "AI Mentor" &&
          renderMentor()}

        {activePage === "Study Plan" &&
          renderStudyPlan()}

        {activePage !== "Dashboard" &&
          activePage !== "Assessment" &&
          activePage !== "AI Mentor" &&
          activePage !== "Study Plan" &&
          renderOtherPage()}
      </main>
    </div>
  );
}

export default App;