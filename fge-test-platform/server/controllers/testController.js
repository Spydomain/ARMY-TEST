import { TestResult, UserAnswer, Question, User } from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../config/db.js';

// @desc    Start a new test session
// @route   POST /api/tests/start
// @access  Private
export const startTest = async (req, res) => {
  try {
    const { category } = req.body;
    const userId = req.user.id;

    // Validate category
    const validCategories = ['IDENT1', 'IDENT2', 'IDENT3', 'IDENT4', 'IDENT5', 'IDENT6'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    // Create a new test result record
    const testResult = await TestResult.create({
      userId,
      category,
      score: 0,
      totalQuestions: 100,
    });

    res.status(201).json({
      testId: testResult.id,
      category,
      startedAt: testResult.createdAt,
    });
  } catch (error) {
    console.error('Start test error:', error);
    res.status(500).json({ message: 'Server error starting test' });
  }
};

// @desc    Submit an answer
// @route   POST /api/tests/:testId/answer
// @access  Private
export const submitAnswer = async (req, res) => {
  try {
    const { testId } = req.params;
    const { questionId, selectedOption, timeSpent } = req.body;
    const userId = req.user.id;

    // Find the test result
    const testResult = await TestResult.findOne({
      where: { id: testId, userId, completedAt: null },
    });

    if (!testResult) {
      return res.status(404).json({ message: 'Active test session not found' });
    }

    // Get the question and correct answer
    const question = await Question.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if answer is correct
    const isCorrect = question.correctAnswer === selectedOption;

    // Record the answer
    await UserAnswer.create({
      testResultId: testResult.id,
      questionId,
      selectedOption,
      isCorrect,
      timeSpent,
    });

    // Get current score
    const correctAnswers = await UserAnswer.count({
      where: { testResultId: testResult.id, isCorrect: true },
    });

    // Calculate score percentage
    const score = Math.round((correctAnswers / testResult.totalQuestions) * 100);

    // Update test result if this was the last question
    const answeredCount = await UserAnswer.count({
      where: { testResultId: testResult.id },
    });

    const isCompleted = answeredCount >= testResult.totalQuestions;
    
    if (isCompleted) {
      testResult.score = score;
      testResult.completedAt = new Date();
      await testResult.save();
    }

    res.json({
      isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: req.query.language === 'fr' && question.explanationFr 
        ? question.explanationFr 
        : question.explanation,
      currentScore: score,
      questionsAnswered: answeredCount,
      isCompleted,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error submitting answer' });
  }
};

// @desc    Get test results
// @route   GET /api/tests/:testId/results
// @access  Private
export const getTestResults = async (req, res) => {
  try {
    const { testId } = req.params;
    const userId = req.user.id;

    const testResult = await TestResult.findOne({
      where: { id: testId, userId },
      include: [
        {
          model: UserAnswer,
          include: [Question],
        },
      ],
    });

    if (!testResult) {
      return res.status(404).json({ message: 'Test results not found' });
    }

    // Calculate category-wise performance
    const categories = {};
    testResult.UserAnswers.forEach(answer => {
      const category = answer.Question.category;
      if (!categories[category]) {
        categories[category] = { correct: 0, total: 0 };
      }
      categories[category].total++;
      if (answer.isCorrect) {
        categories[category].correct++;
      }
    });

    // Format response
    const response = {
      id: testResult.id,
      category: testResult.category,
      score: testResult.score,
      totalQuestions: testResult.totalQuestions,
      completedAt: testResult.completedAt,
      timeSpent: testResult.timeSpent,
      categories: Object.entries(categories).map(([name, stats]) => ({
        name,
        correct: stats.correct,
        total: stats.total,
        percentage: Math.round((stats.correct / stats.total) * 100) || 0,
      })),
      answers: testResult.UserAnswers.map(answer => ({
        questionId: answer.questionId,
        questionText: req.query.language === 'fr' && answer.Question.questionTextFr
          ? answer.Question.questionTextFr
          : answer.Question.questionText,
        selectedOption: answer.selectedOption,
        correctAnswer: answer.Question.correctAnswer,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        explanation: req.query.language === 'fr' && answer.Question.explanationFr
          ? answer.Question.explanationFr
          : answer.Question.explanation,
      })),
    };

    res.json(response);
  } catch (error) {
    console.error('Get test results error:', error);
    res.status(500).json({ message: 'Server error getting test results' });
  }
};

// @desc    Get user's test history
// @route   GET /api/tests/history
// @access  Private
export const getTestHistory = async (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.id };
    if (category) whereClause.category = category;

    const { count, rows } = await TestResult.findAndCountAll({
      where: whereClause,
      order: [['completedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    res.json({
      tests: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Get test history error:', error);
    res.status(500).json({ message: 'Server error getting test history' });
  }
};

// @desc    Get leaderboard
// @route   GET /api/tests/leaderboard
// @access  Public
export const getLeaderboard = async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    const whereClause = { completedAt: { [Op.not]: null } };
    if (category) whereClause.category = category;

    const leaderboard = await TestResult.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
        },
      ],
      attributes: [
        'userId',
        [fn('MAX', col('score')), 'highScore'],
        [fn('COUNT', col('TestResult.id')), 'testsTaken'],
      ],
      group: ['userId'],
      order: [[literal('highScore'), 'DESC']],
      limit: Math.min(parseInt(limit), 100),
      raw: true,
    });

    // Format response
    const formattedLeaderboard = leaderboard.map((entry, index) => ({
      rank: index + 1,
      userId: entry['User.id'],
      username: entry['User.username'],
      highScore: entry.highScore,
      testsTaken: entry.testsTaken,
    }));

    res.json(formattedLeaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error getting leaderboard' });
  }
};
