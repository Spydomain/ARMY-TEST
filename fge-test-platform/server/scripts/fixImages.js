const { Question, sequelize } = require('../models');

// Mapping of question subjects to their image filenames
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

async function updateQuestionImages() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Get all questions
    const questions = await Question.findAll();
    
    let updatedCount = 0;
    
    // Update each question with the correct image URL
    for (const question of questions) {
      if (!question.explanation) continue;
      
      // Extract the subject from the explanation
      const subject = question.explanation
        .replace('Correct answer: ', '')
        .replace('Bonne réponse : ', '')
        .replace('.', '')
        .trim();
      
      const imageName = imageMapping[subject];
      
      if (imageName && !question.imageUrl) {
        // Update the image URL
        question.imageUrl = `/uploads/${imageName}`;
        await question.save();
        updatedCount++;
        console.log(`Updated question ${question.id} with image: ${imageName}`);
      }
    }
    
    console.log(`\nUpdate complete! Updated ${updatedCount} questions with image URLs.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating question images:', error);
    process.exit(1);
  }
}

updateQuestionImages();
