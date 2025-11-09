import { Question, sequelize } from '../models/index.js';
import { Op } from 'sequelize';

// @desc    Get random questions for a category
// @route   GET /api/questions/random/:category
// @access  Private
export const getRandomQuestions = async (req, res) => {
  console.log('=== getRandomQuestions called ===');
  console.log('Params:', req.params);
  console.log('Query:', req.query);
  
  try {
    const { category } = req.params;
    const { limit = 100, language = 'en' } = req.query;

    console.log(`[DEBUG] Request for category: ${category}, limit: ${limit}, language: ${language}`);

    // Validate category
    const validCategories = ['IDENT1', 'IDENT2', 'IDENT3', 'IDENT4', 'IDENT5', 'IDENT6'];
    if (!validCategories.includes(category)) {
      console.log(`[DEBUG] Invalid category requested: ${category}`);
      return res.status(400).json({
        success: false,
        message: 'Invalid category',
        validCategories: validCategories
      });
    }
    
    // Verify database connection
    try {
      await sequelize.authenticate();
      console.log('Database connection has been established successfully.');
    } catch (dbError) {
      console.error('Unable to connect to the database:', dbError);
      return res.status(500).json({ 
        success: false,
        message: 'Database connection error',
        error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }

    // Special handling for IDENT6 (mixed revision test)
    let questions;
    if (category === 'IDENT6') {
      console.log(`[DEBUG] Fetching mixed questions for revision test IDENT6`);
      // Get 2 questions from each category (IDENT1, IDENT2, IDENT3, IDENT4, IDENT5)
      const categoriesToSample = ['IDENT1', 'IDENT2', 'IDENT3', 'IDENT4', 'IDENT5'];
      questions = [];

      for (const cat of categoriesToSample) {
        try {
          const categoryQuestions = await Question.findAll({
            where: { category: cat },
            order: sequelize.random(),
            limit: 2, // 2 questions from each category
            raw: true
          });
          questions.push(...categoryQuestions);
          console.log(`[DEBUG] Added ${categoryQuestions.length} questions from ${cat}`);
        } catch (catError) {
          console.error(`Error fetching questions for ${cat}:`, catError);
        }
      }

      // Shuffle the combined questions
      questions = questions.sort(() => Math.random() - 0.5);
      console.log(`[DEBUG] Total mixed questions for IDENT6: ${questions.length}`);
    } else {
      // Regular category handling
      console.log(`[DEBUG] Fetching questions for category: ${category}`);
      questions = await Question.findAll({
        where: { category },
        order: sequelize.random(),
        limit: Math.min(parseInt(limit), 100), // Max 100 questions
        raw: true // Get plain objects instead of model instances
      });
    }

    console.log(`[DEBUG] Raw questions data for ${category}:`, JSON.stringify(questions, null, 2));
    console.log(`[DEBUG] Found ${questions ? questions.length : 0} questions for category: ${category}`);

    // If no questions found for this category, return error
    if (!questions || questions.length === 0) {
      console.log(`[DEBUG] No questions found for category: ${category}`);
      return res.status(404).json({
        success: false,
        message: `No questions found for category: ${category}`,
        data: []
      });
    }

    // Format response based on language
    const formattedQuestions = questions.map((question, index) => {
      console.log(`[DEBUG] Processing question ${index + 1}/${questions.length} for ${category}`);
      
      // Debug log the raw question data
      console.log(`[DEBUG] Raw question data:`, JSON.stringify(question, null, 2));
      
      // Ensure correctAnswer is one of A, B, C, D
      let correctAnswer = 'A'; // Default value
      
      try {
        if (question.correctAnswer) {
          correctAnswer = String(question.correctAnswer).toUpperCase().trim();
          if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            console.warn(`[WARN] Invalid correctAnswer '${correctAnswer}' for question ${question.id}, defaulting to 'A'`);
            correctAnswer = 'A';
          }
        } else {
          console.warn(`[WARN] Missing correctAnswer for question ${question.id}, defaulting to 'A'`);
        }
      } catch (formatError) {
        console.error(`[ERROR] Error processing correctAnswer for question ${question.id}:`, formatError);
        correctAnswer = 'A'; // Fallback to default
      }

      return {
        id: question.id,
        questionText: language === 'fr' && question.questionTextFr 
          ? question.questionTextFr 
          : question.questionText,
        optionA: question.optionA || 'Option A',
        optionB: question.optionB || 'Option B',
        optionC: question.optionC || 'Option C',
        optionD: question.optionD || 'Option D',
        imageUrl: question.imageUrl ? `http://localhost:5000/uploads/${question.imageUrl}` : null,
        category: question.category || 'IDENT6',
        difficulty: question.difficulty || 'medium',
        correctAnswer: correctAnswer,
        explanation: language === 'fr' && question.explanationFr 
          ? question.explanationFr 
          : (question.explanation || 'No explanation available'),
      };
    });

    // Log final response
    console.log(`[DEBUG] Sending response for ${category} with ${formattedQuestions.length} questions`);
    
    res.json({
      success: true,
      count: formattedQuestions.length,
      data: formattedQuestions
    });
    
  } catch (error) {
    console.error('=== UNHANDLED ERROR in getRandomQuestions ===');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      category: req.params.category,
      query: req.query,
      timestamp: new Date().toISOString()
    });
    
    // More detailed error information
    const errorResponse = {
      success: false,
      message: 'Internal server error',
      timestamp: new Date().toISOString(),
      path: req.originalUrl
    };
    
    // Include more details in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = error.message;
      errorResponse.stack = error.stack;
    }
    
    res.status(500).json(errorResponse);
  } finally {
    console.log(`[DEBUG] Completed request for category: ${req.params.category}`);
  }
};

// @desc    Get all questions (admin only)
// @route   GET /api/questions
// @access  Private/Admin
export const getAllQuestions = async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (category) whereClause.category = category;
    if (difficulty) whereClause.difficulty = difficulty;
    if (search) {
      whereClause[Op.or] = [
        { questionText: { [Op.like]: `%${search}%` } },
        { questionTextFr: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Question.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      questions: rows,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error('Get all questions error:', error);
    res.status(500).json({ message: 'Server error getting questions' });
  }
};

// @desc    Create a new question (admin only)
// @route   POST /api/questions
// @access  Private/Admin
export const createQuestion = async (req, res) => {
  try {
    const {
      category,
      questionText,
      questionTextFr,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      imageUrl,
      difficulty,
      explanation,
      explanationFr,
    } = req.body;

    const question = await Question.create({
      category,
      questionText,
      questionTextFr,
      optionA,
      optionB,
      optionC,
      optionD,
      correctAnswer,
      imageUrl,
      difficulty: difficulty || 'medium',
      explanation,
      explanationFr,
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Create question error:', error);
    res.status(500).json({ message: 'Server error creating question' });
  }
};

// @desc    Update a question (admin only)
// @route   PUT /api/questions/:id
// @access  Private/Admin
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Update only the fields that are provided in the request
    const updatableFields = [
      'category',
      'questionText',
      'questionTextFr',
      'optionA',
      'optionB',
      'optionC',
      'optionD',
      'correctAnswer',
      'imageUrl',
      'difficulty',
      'explanation',
      'explanationFr',
    ];

    updatableFields.forEach(field => {
      if (req.body[field] !== undefined) {
        question[field] = req.body[field];
      }
    });

    await question.save();
    res.json(question);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error updating question' });
  }
};

// @desc    Delete a question (admin only)
// @route   DELETE /api/questions/:id
// @access  Private/Admin
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.destroy();
    res.json({ message: 'Question removed' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error deleting question' });
  }
};
