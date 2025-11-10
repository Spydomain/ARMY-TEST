// Update questions with correct image URLs and question text
const { Question, sequelize } = require('../models');

// Mapping of vehicle names to image filenames
const imageMapping = {
  'BTR-60': 'BTR 60.png',
  'BTR-70': 'BTR 70.png',
  'BTR-80': 'BTR 80.png',
  'BTR-80A': 'BTR 80 A.png',
  'BRDM-2': 'BRDM 2.png',
  'BMP-1': 'BMP 1.png',
  'BMP-2': 'BMP 2.png',
  'BMP-3': 'BMP 3.png',
  'BMD-1': 'BMD 1.png',
  'BMD-2': 'BMD 2.png',
  'BMD-3': 'BMD 3.png',
  'T-54/55': 'T 54 55.png',
  'T-62': 'T 62.png',
  'T-64': 'T 64.png',
  'T-72': 'T 72.png',
  'T-80': 'T 80.png',
  'T-90': 'T 90.png',
  'AK-47': 'AK-47.png',
  'AKM': 'AKM.png',
  'AK-74': 'AK-74.png',
  'RPK': 'RPK.png',
  'PKM': 'PKM.png',
  'SVD': 'SVD.png',
  'RPG-7': 'RPG 7.png',
  'AGS-17': 'AGS 17.png',
  'Mi-8/17': 'MI-8.png',
  'Mi-24': 'MI-24.png',
  'Mi-26': 'Mi-26.png',
  'Mi-28': 'MI-28.png',
  'Ka-52': 'Mi-52.png' // Assuming Mi-52.png is the correct image for Ka-52
};

// Function to extract vehicle name from explanation
function getVehicleName(explanation) {
  if (!explanation) return null;
  const match = explanation.match(/Correct answer: ([^.]+)/);
  return match ? match[1].trim() : null;
}

// Function to update questions
async function updateQuestions() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Get all questions
    const questions = await Question.findAll();
    console.log(`Found ${questions.length} questions`);

    let updatedCount = 0;

    // Update each question
    for (const question of questions) {
      const vehicleName = getVehicleName(question.explanation);
      
      if (vehicleName) {
        const imageName = imageMapping[vehicleName];
        
        // Update question text and image URL
        question.questionText = `Identify this military vehicle: ${vehicleName}`;
        question.questionTextFr = `Identifiez ce véhicule militaire: ${vehicleName}`;
        
        if (imageName) {
          question.imageUrl = `/uploads/${imageName}`;
        }

        // Set options based on vehicle name
        const options = Object.keys(imageMapping)
          .filter(name => name !== vehicleName)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        
        options.push(vehicleName);
        options.sort(() => Math.random() - 0.5);

        question.optionA = options[0] || '';
        question.optionB = options[1] || '';
        question.optionC = options[2] || '';
        question.optionD = options[3] || '';
        question.correctAnswer = String.fromCharCode(65 + options.indexOf(vehicleName));

        await question.save();
        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`Updated ${updatedCount} questions`);
        }
      }
    }

    console.log(`\nUpdate complete! Updated ${updatedCount} questions`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating questions:', error);
    process.exit(1);
  }
}

// Run the update
updateQuestions();
