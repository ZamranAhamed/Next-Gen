const QuizModel = require("../models/Quizmodel.js");



// Add new quiz
const addQuiz = async (req, res) => {
  try {
    const { question, answerone, answertwo, answerthree, correctanswer } = req.body;

    if (!question || !answerone || !answertwo || !answerthree || !correctanswer) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const newQuiz = new QuizModel({
      question,
      answerOne: answerone,
      answerTwo: answertwo,
      answerThree: answerthree,
      correctAnswer: correctanswer,
    });

    await newQuiz.save();
    res.status(201).json({ success: true, message: "Question added successfully", data: newQuiz });
  } catch (error) {
    console.error("Error adding question", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Display all quizzes
const displayQuiz = async (req, res) => {
  try {
    const quiz = await QuizModel.find();
    res.status(200).json(quiz);
  } catch (error) {
    console.error("Error fetching quiz data", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Delete quiz
const deleteQuiz = async (req, res) => {
  const { id } = req.params;
  const deleteObj = await QuizModel.findByIdAndDelete({ _id: id });
  return res.status(200).json({ data: deleteObj });
};

// Update only correct answer
const editcorrectanswer = async (req, res) => {
  const { correctanswer } = req.body;
  const { id } = req.params;

  const updateanswer = await QuizModel.findByIdAndUpdate(
    id,
    { $set: { correctAnswer: correctanswer } },
    { new: true }
  );

  return res.json({ message: "Correct answer updated successfully", data: updateanswer });
};

// ✅ Update full quiz: question, answers, correct answer
const editQesAndAns = async (req, res) => {
  const { question, answerone, answertwo, answerthree, correctanswer } = req.body;
  const { id } = req.params;

  try {
    const updateQuesAndAns = await QuizModel.findByIdAndUpdate(
      id,
      {
        $set: {
          question,
          answerOne: answerone,
          answerTwo: answertwo,
          answerThree: answerthree,
          correctAnswer: correctanswer,
        },
      },
      { new: true }
    );

    if (!updateQuesAndAns) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.json({ success: true, message: "Question and answers updated successfully", data: updateQuesAndAns });
  } catch (error) {
    console.error("Error updating question and answers", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const submitQuizResult = async (req, res) => {
  try {
    const { studentId, score, total, date, answers } = req.body;

    if (!studentId || score == null || total == null || !answers) {
      return res.status(400).json({ success: false, message: "Incomplete data" });
    }

    const result = new ResultModel({
      studentId,
      score,
      total,
      date,
      answers,
    });

    await result.save();

    res.status(201).json({ success: true, message: "Result stored", data: result });
  } catch (err) {
    console.error("Error saving result:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /results/:studentId
const getStudentResults = async (req, res) => {
  const { studentId } = req.params;

  try {
    const results = await ResultModel.find({ studentId }).sort({ date: -1 });
    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("Error fetching student results:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /results (admin/leaderboard)
const getAllResults = async (req, res) => {
  try {
    const results = await ResultModel.find().sort({ score: -1, date: 1 });
    res.status(200).json({ success: true, results });
  } catch (err) {
    console.error("Error fetching all results:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


module.exports = {
  addQuiz,
  displayQuiz,
  deleteQuiz,
  editcorrectanswer,
  editQesAndAns,
  submitQuizResult, // ✅ Add this line
};
