// Update questions with correct image URLs and question text
import { Question, sequelize } from '../models/index.js';

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

    // Get all questions for IDENT1 category
    const questions = await Question.findAll({
      where: { category: 'IDENT1' },
      limit: 100 // Limit to 100 questions to avoid timeout
    });
    
    console.log(`Found ${questions.length} questions for IDENT1`);

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
          console.log(`Updating question ${question.id} with image: ${imageName}`);
        } else {
          console.warn(`No image found for vehicle: ${vehicleName}`);
          continue; // Skip if no image found
        }

        // Set options based on vehicle name
        const allVehicles = Object.keys(imageMapping);
        const options = [];
        
        // Add 3 random incorrect options
        while (options.length < 3) {
          const randomIndex = Math.floor(Math.random() * allVehicles.length);
          const randomVehicle = allVehicles[randomIndex];
          if (randomVehicle !== vehicleName && !options.includes(randomVehicle)) {
            options.push(randomVehicle);
          }
        }
        
        // Add the correct answer
        options.push(vehicleName);
        
        // Shuffle the options
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [options[i], options[j]] = [options[j], options[i]];
        }

        // Update question with options
        question.optionA = options[0] || '';
        question.optionB = options[1] || '';
        question.optionC = options[2] || '';
        question.optionD = options[3] || '';
        question.correctAnswer = String.fromCharCode(65 + options.indexOf(vehicleName));

        await question.save();
        updatedCount++;
      }
    }

    console.log(`\nUpdate complete! Updated ${updatedCount} questions`);
    
    // Test the API endpoint
    console.log('\nTesting API endpoint...');
    const testQuestions = await Question.findAll({
      where: { category: 'IDENT1' },
      limit: 5,
      attributes: ['id', 'questionText', 'imageUrl', 'optionA', 'optionB', 'optionC', 'optionD', 'correctAnswer']
    });
    
    console.log('\nSample updated questions:');
    console.log(JSON.stringify(testQuestions, null, 2));
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating questions:', error);
    process.exit(1);
  }
}

// Run the update
updateQuestions();
