const express = require("express");
const router = express.Router();

const Question = require("../models/Question");
const Answer = require("../models/Answer");

// Create a new question
router.post("/questions", async (req, res) => {
  try {
    const { title, description, tags, region } = req.body;  // include region here

    // Optional: add validation for region if required
    if (!region) {
      return res.status(400).json({ error: "Region is required." });
    }

    const question = new Question({ title, description, tags, region });
    await question.save();
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});


// Get all questions
router.get("/questions", async (req, res) => {
  try {
    const questions = await Question.find();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a question by ID (with answers)
router.get("/questions/:id", async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const answers = await Answer.find({ questionId: question._id });
    res.json({ question, answers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create an answer for a question
router.post("/questions/:id/answers", async (req, res) => {
  try {
    const questionId = req.params.id;
    const { answer } = req.body;

    // Check if question exists
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ error: "Question not found" });

    const newAnswer = new Answer({ questionId, answer });
    await newAnswer.save();
    res.status(201).json(newAnswer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all answers (optional endpoint)
router.get("/answers", async (req, res) => {
  try {
    const answers = await Answer.find();
    res.json(answers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
