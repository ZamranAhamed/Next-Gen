const express = require("express");

const {
  addQuiz,
  displayQuiz,
  deleteQuiz,
  editcorrectanswer,
  submitQuizResult, // ✅ Add this import
} = require("../controllers/Quizcontroller.js");

const router = express.Router();

router.post("/addquiz", addQuiz);
router.get("/displayquiz", displayQuiz);
router.delete("/deletequiz/:id", deleteQuiz);
router.put("/updatequiz/:id", editcorrectanswer);


// ✅ New route to store quiz result
router.post("/submit-quiz-result", submitQuizResult);

module.exports = router;