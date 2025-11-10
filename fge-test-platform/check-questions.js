// Set up MySQL connection
const mysql = require('mysql2/promise');
require('dotenv').config({ path: '../.env' });

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

async function checkQuestions() {
  let connection;
  try {
    // Create connection to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to the database');

    // Get 10 random questions to check
    const [questions] = await connection.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, 
              category, difficulty, correct_answer, explanation 
       FROM Question 
       WHERE question_text = 'Question text missing' 
          OR question_text IS NULL
          OR explanation IS NULL
       LIMIT 10`
    );

    console.log(`\n📊 Found ${questions.length} questions with issues`);
    
    if (questions.length > 0) {
      console.log('\nSample of questions with issues:');
      questions.forEach((q, index) => {
        console.log(`\n--- Question #${index + 1} ---`);
        console.log(`ID: ${q.id}`);
        console.log(`Question: ${q.question_text || 'MISSING'}`);
        console.log(`Options: A) ${q.option_a}, B) ${q.option_b}, C) ${q.option_c}, D) ${q.option_d}`);
        console.log(`Correct: ${q.correct_answer}`);
        console.log(`Explanation: ${q.explanation || 'MISSING'}`);
      });
    } else {
      console.log('\n✅ No questions with missing text found!');
      
      // Show some sample questions to verify
      const [sampleQuestions] = await connection.query(
        `SELECT id, question_text, correct_answer, explanation 
         FROM Question 
         ORDER BY RAND() 
         LIMIT 3`
      );
      
      console.log('\nSample of good questions:');
      sampleQuestions.forEach((q, index) => {
        console.log(`\n--- Sample Question #${index + 1} ---`);
        console.log(`ID: ${q.id}`);
        console.log(`Question: ${q.question_text}`);
        console.log(`Correct Answer: ${q.correct_answer}`);
        console.log(`Explanation: ${q.explanation}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Database error:', error);
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the check function
checkQuestions();
