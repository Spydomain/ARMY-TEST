// Set up MySQL connection
const mysql = require('mysql2/promise');

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Validate required environment variables
const requiredEnvVars = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Error: Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Questions to update
const questionsToUpdate = [
  {
    id: 1,
    questionText: 'This 4x4 amphibious armored scout car features a distinctive boat-shaped hull and conical turret. What is it?',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'MT-LB',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'The correct answer is BRDM-2, a Soviet amphibious armored scout car.'
  },
  {
    id: 2,
    questionText: 'This 8x8 wheeled APC was developed in the 1970s and features a conical turret with a 14.5mm KPVT heavy machine gun. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BTR-90',
    category: 'IDENT1',
    difficulty: 'hard',
    correctAnswer: 'B',
    explanation: 'The correct answer is BTR-70, which replaced the BTR-60 in Soviet service.'
  },
  {
    id: 3,
    questionText: 'This 8x8 wheeled APC features a 30mm automatic cannon in a small turret and is a modernized version of the BTR-80. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-90',
    optionD: 'BTR-4',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'The correct answer is BTR-80A, featuring a 30mm 2A72 cannon.'
  },
  {
    id: 4,
    questionText: 'This 4x4 amphibious armored vehicle is a modernized version of the BRDM-2 with improved optics and armament. What is it?',
    optionA: 'BRDM-2M',
    optionB: 'BRDM-3',
    optionC: 'BRM-1K',
    optionD: 'BTR-40',
    category: 'IDENT1',
    difficulty: 'hard',
    correctAnswer: 'A',
    explanation: 'The correct answer is BRDM-2M, a modernized version of the BRDM-2.'
  },
  {
    id: 5,
    questionText: 'This 8x8 wheeled APC was the first of its kind in the Soviet Union, featuring a distinctive flat front and high-mounted headlights. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'The correct answer is BTR-60, the first Soviet 8x8 wheeled APC.'
  }
];

async function updateQuestions() {
  let connection;
  try {
    // Create connection to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to the database');

    // Update each question
    for (const question of questionsToUpdate) {
      try {
        const [result] = await connection.execute(
          `UPDATE Question SET 
            question_text = ?, 
            option_a = ?, 
            option_b = ?, 
            option_c = ?, 
            option_d = ?, 
            category = ?, 
            difficulty = ?, 
            correct_answer = ?, 
            explanation = ?,
            updated_at = NOW()
          WHERE id = ?`,
          [
            question.questionText,
            question.optionA,
            question.optionB,
            question.optionC,
            question.optionD,
            question.category,
            question.difficulty,
            question.correctAnswer,
            question.explanation,
            question.id
          ]
        );

        if (result.affectedRows > 0) {
          console.log(`✅ Updated question ID ${question.id}`);
        } else {
          console.log(`⚠️  Question ID ${question.id} not found`);
        }
      } catch (error) {
        console.error(`❌ Error updating question ID ${question.id}:`, error.message);
      }
    }

    console.log('\n🎉 Update process completed!');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the update function
updateQuestions();
