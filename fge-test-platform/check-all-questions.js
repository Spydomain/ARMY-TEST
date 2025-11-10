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

async function checkQuestions() {
  let connection;
  try {
    // Create connection to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to the database');

    // Get all questions
    const [questions] = await connection.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, 
              category, difficulty, correct_answer, explanation 
       FROM Question 
       ORDER BY id`
    );

    console.log(`\n📊 Total questions in database: ${questions.length}`);
    
    // Find questions that need updating
    const needsUpdate = questions.filter(q => 
      !q.question_text || 
      q.question_text.startsWith('Identify this military vehicle:') ||
      !q.explanation
    );

    console.log(`\n⚠️  Questions needing updates: ${needsUpdate.length}`);
    
    if (needsUpdate.length > 0) {
      console.log('\n📋 Sample of questions that need updating:');
      console.table(needsUpdate.slice(0, 5).map(q => ({
        id: q.id,
        question: q.question_text?.substring(0, 50) + (q.question_text?.length > 50 ? '...' : ''),
        category: q.category,
        hasExplanation: !!q.explanation
      })));
      
      // Save the IDs of questions that need updating
      const idsNeedingUpdate = needsUpdate.map(q => q.id);
      console.log('\n🔢 Question IDs needing updates (first 20):', idsNeedingUpdate.slice(0, 20).join(', '));
      
      if (idsNeedingUpdate.length > 20) {
        console.log(`   ...and ${idsNeedingUpdate.length - 20} more`);
      }
      
      return idsNeedingUpdate;
    } else {
      console.log('🎉 All questions appear to be up to date!');
      return [];
    }
    
  } catch (error) {
    console.error('❌ Error checking questions:', error);
    return [];
  } finally {
    // Close the database connection
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the check function
checkQuestions().then(idsNeedingUpdate => {
  if (idsNeedingUpdate.length > 0) {
    console.log('\n💡 Run the update script to fix these questions.');
  }
});
