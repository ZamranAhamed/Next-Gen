import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./quizstyle/QuizAdmin.css";
import Header from "../../Header/Header";

function QuizAdmin() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [editQuizId, setEditQuizId] = useState(null);
  const [editedQuiz, setEditedQuiz] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get("http://localhost:4000/Backend/quiz/displayquiz");
      setQuizzes(response.data);
      setFilteredQuizzes(response.data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const handleSearch = () => {
    const term = searchTerm.toLowerCase();
    const filtered = quizzes.filter((q) =>
      q.question.toLowerCase().includes(term)
    );
    setFilteredQuizzes(filtered);
  };

  const generateReport = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Quiz Summary Report", 70, 15);

    autoTable(doc, {
      startY: 25,
      head: [["#", "Question", "Correct Answer"]],
      body: quizzes.map((quiz, index) => [
        index + 1,
        quiz.question,
        quiz.correctAnswer
      ]),
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    doc.save("Quiz_Summary_Report.pdf");
  };

  const handleDelete = async (quizId) => {
    const confirmDelete = window.confirm("You cannot recover a deleted quiz. Are you sure?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:4000/Backend/quiz/deletequiz/${quizId}`);
      const updatedQuizzes = quizzes.filter((quiz) => quiz._id !== quizId);
      setQuizzes(updatedQuizzes);
      setFilteredQuizzes(updatedQuizzes);
      setSuccessMessage("Quiz was Successfully Deleted");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
  };

  const startEditing = (quiz) => {
    setEditQuizId(quiz._id);
    setEditedQuiz({
      question: quiz.question,
      answerone: quiz.answerOne,
      answertwo: quiz.answerTwo,
      answerthree: quiz.answerThree,
      correctanswer: quiz.correctAnswer,
    });
  };

  const handleInputChange = (field, value) => {
    setEditedQuiz({ ...editedQuiz, [field]: value });
  };

  const handleUpdate = async (quizId) => {
    try {
      await axios.put(`http://localhost:4000/Backend/quiz/updatefullquiz/${quizId}`, editedQuiz);

      const updatedQuizzes = quizzes.map((q) =>
        q._id === quizId
          ? {
              ...q,
              question: editedQuiz.question,
              answerOne: editedQuiz.answerone,
              answerTwo: editedQuiz.answertwo,
              answerThree: editedQuiz.answerthree,
              correctAnswer: editedQuiz.correctanswer,
            }
          : q
      );

      setQuizzes(updatedQuizzes);
      setFilteredQuizzes(updatedQuizzes);
      setEditQuizId(null);
      setSuccessMessage("Quiz was Successfully Updated");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  return (
    <div className="background" style={{ backgroundColor: "#FCE8E0" }}>
      <Header />
      <div className="top-bar">
        <div className="search-section">
          <input
            type="text"
            placeholder="Search Quizzes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button className="search-button" onClick={handleSearch}>
            <span role="img" aria-label="search">🔍</span>&nbsp;Search
          </button>
        </div>
        <div className="button-column">
          <button className="add-button" onClick={() => navigate("/addnewquiz")}>Add Questions</button>
          <button className="report-button" onClick={generateReport}>📄 Report</button>
        </div>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}

      <h2 className="quiztopic">Implemented Quizzes</h2>
      {filteredQuizzes.length === 0 ? (
        <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>No quizzes available</p>
      ) : (
        filteredQuizzes.map((quiz, index) => (
          <div key={quiz._id} className="container" style={{ backgroundColor: "white" }}>
            <button className="delete-button" onClick={() => handleDelete(quiz._id)}>x</button>
            {editQuizId === quiz._id ? (
              <div>
                <label>Question</label>
                <input
                  type="text"
                  value={editedQuiz.question}
                  onChange={(e) => handleInputChange("question", e.target.value)}
                />
                <label>Answer One</label>
                <input
                  type="text"
                  value={editedQuiz.answerone}
                  onChange={(e) => handleInputChange("answerone", e.target.value)}
                />
                <label>Answer Two</label>
                <input
                  type="text"
                  value={editedQuiz.answertwo}
                  onChange={(e) => handleInputChange("answertwo", e.target.value)}
                />
                <label>Answer Three</label>
                <input
                  type="text"
                  value={editedQuiz.answerthree}
                  onChange={(e) => handleInputChange("answerthree", e.target.value)}
                />
                <label>Correct Answer</label>
                <select
                  value={editedQuiz.correctanswer}
                  onChange={(e) => handleInputChange("correctanswer", e.target.value)}
                >
                  <option value="">Select</option>
                  <option value={editedQuiz.answerone}>{editedQuiz.answerone}</option>
                  <option value={editedQuiz.answertwo}>{editedQuiz.answertwo}</option>
                  <option value={editedQuiz.answerthree}>{editedQuiz.answerthree}</option>
                </select>
                <button className="save-button" onClick={() => handleUpdate(quiz._id)}>Save</button>
                <button className="cancel-button" onClick={() => setEditQuizId(null)}>Cancel</button>
              </div>
            ) : (
              <>
                <p style={{ color: "#0056ab", fontSize: "20px" }}>
                  <strong>Question {index + 1}:</strong> {quiz.question}
                </p>
                <ul>
                  <li style={{ fontSize: "18px" }}>{quiz.answerOne}</li>
                  <li style={{ fontSize: "18px" }}>{quiz.answerTwo}</li>
                  <li style={{ fontSize: "18px" }}>{quiz.answerThree}</li>
                </ul>
                <p style={{ fontSize: "18px" }}>
                  <strong style={{ color: "red" }}>Correct Answer:</strong> {quiz.correctAnswer}
                </p>
                <button className="update-button" onClick={() => startEditing(quiz)}>Update</button>
              </>
            )}
          </div>
        ))
      )}
      <br />
    </div>
  );
}

export default QuizAdmin;
