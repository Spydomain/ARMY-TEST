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

// Question templates for different vehicle types
const questionTemplates = {
  'BTR-80A': {
    text: 'This 8x8 wheeled APC features a 30mm automatic cannon in a small turret and is a modernized version of the BTR-80. What is it?',
    options: ['BTR-80A', 'BTR-82A', 'BTR-90', 'BTR-4'],
    correct: 0,
    explanation: 'The BTR-80A is an upgraded version of the BTR-80, featuring a 30mm 2A72 automatic cannon in a small turret.'
  },
  'BRDM-2': {
    text: 'This 4x4 amphibious armored scout car features a distinctive boat-shaped hull and conical turret. What is it?',
    options: ['BRDM-2', 'BTR-60', 'MT-LB', 'BMP-1'],
    correct: 0,
    explanation: 'The BRDM-2 is a Soviet amphibious armored scout car known for its distinctive boat-shaped hull and conical turret.'
  },
  'BTR-70': {
    text: 'This 8x8 wheeled APC was developed in the 1970s and features a conical turret with a 14.5mm KPVT heavy machine gun. What is it?',
    options: ['BTR-60', 'BTR-70', 'BTR-80', 'BTR-90'],
    correct: 1,
    explanation: 'The BTR-70 is a Soviet 8x8 wheeled armored personnel carrier that entered service in the 1970s.'
  },
  'BTR-60': {
    text: 'This 8x8 wheeled APC was the first of its kind in the Soviet Union, featuring a distinctive flat front and high-mounted headlights. What is it?',
    options: ['BTR-60', 'BTR-70', 'BTR-80', 'BMP-1'],
    correct: 0,
    explanation: 'The BTR-60 was the first Soviet 8x8 wheeled APC, introduced in the 1960s with a distinctive flat front design.'
  },
  'BMP-1': {
    text: 'This tracked infantry fighting vehicle was the first mass-produced IFV of the Soviet Union, featuring a 73mm smoothbore gun. What is it?',
    options: ['BMP-1', 'BMP-2', 'BMP-3', 'BMD-1'],
    correct: 0,
    explanation: 'The BMP-1 was the first mass-produced IFV in the Soviet Union, introduced in the 1960s with a 73mm 2A28 Grom low-pressure smoothbore gun.'
  },
  'BMP-2': {
    text: 'This improved version of the BMP-1 features a 30mm automatic cannon in a two-man turret. What is it?',
    options: ['BMP-1', 'BMP-2', 'BMP-3', 'BMD-2'],
    correct: 1,
    explanation: 'The BMP-2 is an upgraded version of the BMP-1, featuring a 30mm 2A42 autocannon in a two-man turret.'
  },
  'T-72': {
    text: 'This main battle tank features a distinctive low profile, composite armor, and a 125mm smoothbore gun. What is it?',
    options: ['T-64', 'T-72', 'T-80', 'T-90'],
    correct: 1,
    explanation: 'The T-72 is a Soviet main battle tank that entered production in 1969, known for its low profile and 125mm 2A46 smoothbore gun.'
  },
  'T-90': {
    text: 'This modern Russian main battle tank features Shtora-1 electro-optical jammers and Kontakt-5 explosive reactive armor. What is it?',
    options: ['T-80U', 'T-90', 'T-14 Armata', 'T-72B3'],
    correct: 1,
    explanation: 'The T-90 is a Russian main battle tank that features advanced protection systems including Shtora-1 and Kontakt-5 ERA.'
  },
  'MT-LB': {
    text: 'This Soviet multi-purpose tracked armored vehicle is often used as an artillery tractor and features a distinctive boxy shape. What is it?',
    options: ['MT-LB', 'BMP-1', 'BTR-D', 'BMD-1'],
    correct: 0,
    explanation: 'The MT-LB is a Soviet multi-purpose tracked armored vehicle known for its versatility and distinctive boxy shape.'
  },
  '2S3 Akatsiya': {
    text: 'This 152mm self-propelled howitzer is mounted on a tracked chassis and was first introduced in the Soviet Army in 1971. What is it?',
    options: ['2S1 Gvozdika', '2S3 Akatsiya', '2S5 Giatsint', '2S7 Pion'],
    correct: 1,
    explanation: 'The 2S3 Akatsiya is a 152mm self-propelled howitzer that entered Soviet service in 1971.'
  }
};

// Function to generate a question based on the vehicle name
function generateQuestion(vehicleName) {
  // Try to find an exact match first
  for (const [key, template] of Object.entries(questionTemplates)) {
    if (vehicleName.includes(key)) {
      return {
        ...template,
        text: template.text.replace('?', ` (${key})?`) // Add vehicle name to the question
      };
    }
  }
  
  // If no exact match, find a partial match
  const vehicleKey = Object.keys(questionTemplates).find(key => 
    vehicleName.includes(key.split(' ')[0]) // Match the first word of the vehicle name
  );
  
  if (vehicleKey) {
    const template = questionTemplates[vehicleKey];
    return {
      ...template,
      text: template.text.replace('?', ` (${vehicleName})?`) // Use the full vehicle name
    };
  }
  
  // Default template if no match is found
  return {
    text: `This military vehicle is a ${vehicleName}. Can you identify it?`,
    options: [vehicleName, 'BTR-80', 'BMP-1', 'T-72'],
    correct: 0,
    explanation: `The correct answer is ${vehicleName}.`
  };
}

async function updateAllQuestions() {
  let connection;
  try {
    // Create connection to the database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Successfully connected to the database');

    // Get all questions that need updating
    const [questions] = await connection.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, 
              category, difficulty, correct_answer, explanation 
       FROM Question 
       WHERE question_text LIKE 'Identify this military vehicle:%' 
          OR question_text IS NULL
          OR explanation IS NULL
       ORDER BY id`
    );

    console.log(`\n📊 Found ${questions.length} questions to update`);
    
    let updatedCount = 0;
    
    // Update each question
    for (const question of questions) {
      try {
        // Extract the vehicle name from the question text
        let vehicleName = '';
        if (question.question_text && question.question_text.startsWith('Identify this military vehicle:')) {
          vehicleName = question.question_text.replace('Identify this military vehicle:', '').trim();
        } else {
          // If no question text, try to get the correct answer as the vehicle name
          const correctOption = question[`option_${question.correct_answer.toLowerCase()}`];
          if (correctOption) {
            vehicleName = correctOption;
          } else {
            console.log(`⚠️  Could not determine vehicle name for question ID ${question.id}`);
            continue;
          }
        }
        
        // Generate the updated question
        const updatedQuestion = generateQuestion(vehicleName);
        
        // Update the question in the database
        const [result] = await connection.execute(
          `UPDATE Question SET 
            question_text = ?, 
            option_a = ?, 
            option_b = ?, 
            option_c = ?, 
            option_d = ?, 
            correct_answer = ?,
            explanation = ?,
            updated_at = NOW()
          WHERE id = ?`,
          [
            updatedQuestion.text,
            updatedQuestion.options[0],
            updatedQuestion.options[1],
            updatedQuestion.options[2],
            updatedQuestion.options[3],
            String.fromCharCode(65 + updatedQuestion.correct), // Convert index to A-D
            updatedQuestion.explanation,
            question.id
          ]
        );

        if (result.affectedRows > 0) {
          updatedCount++;
          if (updatedCount % 50 === 0) {
            console.log(`✅ Updated ${updatedCount} questions so far...`);
          }
        }
      } catch (error) {
        console.error(`❌ Error updating question ID ${question.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${updatedCount} out of ${questions.length} questions`);
    
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

// Run the update function
updateAllQuestions();
