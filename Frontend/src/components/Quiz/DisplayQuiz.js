import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import "../Quiz/quizstyle/DisplayQuiz.css";
import Header from "../../Header/Header";
import { CSSTransition, TransitionGroup } from "react-transition-group";

function DisplayQuiz() {
  const location = useLocation();
  const [quizzes, setQuizzes] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizDuration, setQuizDuration] = useState(60);

  useEffect(() => {
    const quizType = location.state?.quizType || "easy";
    let timerValue = quizType === "easy" ? 60 : quizType === "medium" ? 45 : 30;
    setTimeLeft(timerValue);
    setQuizDuration(timerValue);
  }, [location.state]);

  useEffect(() => {
    axios
      .get("http://localhost:4000/Backend/quiz/displayquiz")
      .then((res) => setQuizzes(res.data))
      .catch((err) => console.error("Error fetching quizzes:", err));
  }, []);

  useEffect(() => {
    if (showResults) return;
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          alert("Time is up! Submitting your answers.");
          handleFinish(); // Auto-submit
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [showResults]);

  const handleAnswerChange = (quizId, answer) => {
    setUserAnswers((prev) => ({ ...prev, [quizId]: answer }));
  };

  const handleNext = () => setCurrentQuestionIndex((prev) => prev + 1);
  const handleBack = () => setCurrentQuestionIndex((prev) => prev - 1);

  const submitScoreToBackend = async (finalScore) => {
    try {
      const payload = {
        studentId: localStorage.getItem("studentId") || "anonymous",
        score: finalScore,
        total: quizzes.length,
        date: new Date().toISOString(),
        answers: userAnswers,
      };
      await axios.post(
        "http://localhost:4000/Backend/quiz/submit-quiz-result",
        payload
      );
    } catch (err) {
      console.error("Failed to submit score:", err);
    }
  };

  const handleFinish = () => {
    const unanswered = quizzes.some((quiz) => !userAnswers[quiz._id]);
    if (unanswered) {
      alert("Please answer all the questions before finishing the quiz.");
      return;
    }

    const calculatedScore = quizzes.reduce((acc, quiz) => {
      return userAnswers[quiz._id] === quiz.correctAnswer ? acc + 1 : acc;
    }, 0);

    setScore(calculatedScore);
    setShowResults(true);
    submitScoreToBackend(calculatedScore);
  };

  if (showResults) {
    return (
      <div>
        <Header />
        <div className="container" style={{ backgroundColor: "#f9dace" }}>
          <h3>Quiz Results</h3>
          <p style={{ color: "red", fontSize: "15px" }}>
            <strong>Total Score:</strong> {score} / {quizzes.length}
          </p>
          {quizzes.map((quiz, index) => {
            const isCorrect = userAnswers[quiz._id] === quiz.correctAnswer;
            return (
              <div
                key={quiz._id}
                className={`quiz-item ${isCorrect ? "correct" : "wrong"}`}
              >
                <p>
                  <strong style={{ color: "#4da6ff" }}>
                    Question {index + 1}:
                  </strong>{" "}
                  <span style={{ color: "black" }}>{quiz.question}</span>
                </p>
                <p>
                  <strong>Your Answer:</strong>{" "}
                  <span style={{ color: isCorrect ? "green" : "red" }}>
                    {userAnswers[quiz._id] || "No answer"}
                  </span>
                </p>
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  <span style={{ color: "green" }}>{quiz.correctAnswer}</span>
                </p>
              </div>
            );
          })}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-warning"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (quizzes.length === 0) return <p>Loading...</p>;

  const currentQuiz = quizzes[currentQuestionIndex];

  return (
    <div className="bkimg">
      <Header />
      <div>
        <h1>Weekly Quiz Challenge</h1>
        <h4>
          Question {currentQuestionIndex + 1}/{quizzes.length}
        </h4>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${((currentQuestionIndex + 1) / quizzes.length) * 100}%`,
            }}
          ></div>
        </div>

        <div className="timer-progress-bar">
          <div
            className="timer-fill"
            style={{
              width: `${(timeLeft / quizDuration) * 100}%`,
            }}
          ></div>
        </div>

        <div className="container">
          <TransitionGroup>
            <CSSTransition
              key={currentQuiz._id}
              timeout={300}
              classNames="fade"
            >
              <div className="quiz-item">
                <p style={{ color: "black", fontWeight: "bold" }}>
                  {currentQuiz.question}
                </p>
                {[
                  currentQuiz.answerOne,
                  currentQuiz.answerTwo,
                  currentQuiz.answerThree,
                ].map((answer, i) => (
                  <div key={i} style={{ marginBottom: "10px" }}>
                    <label
                      className={`quiz-option ${
                        userAnswers[currentQuiz._id] === answer
                          ? "selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name={`quiz-${currentQuiz._id}`}
                        value={answer}
                        onChange={() =>
                          handleAnswerChange(currentQuiz._id, answer)
                        }
                        checked={userAnswers[currentQuiz._id] === answer}
                      />
                      {answer}
                    </label>
                  </div>
                ))}
              </div>
            </CSSTransition>
          </TransitionGroup>

          <div className="navigation-buttons">
            {currentQuestionIndex > 0 && (
              <button onClick={handleBack} className="btn btn-secondary">
                Back
              </button>
            )}
            {currentQuestionIndex < quizzes.length - 1 ? (
              <button onClick={handleNext} className="btn btn-primary">
                Next
              </button>
            ) : (
              <button onClick={handleFinish} className="btn btn-success">
                Finish
              </button>
            )}
          </div>
          <h5 style={{ color: timeLeft <= 5 ? "red" : "black" }}>
            Time Left: {timeLeft} seconds
          </h5>
        </div>
      </div>
    </div>
  );
}

export default DisplayQuiz;
