import { Question, sequelize } from '../models/index.js';
import { imageMapping } from './imageMapping.js';
import path from 'path';

async function updateQuestionImages() {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    // Get all questions
    const questions = await Question.findAll();
    
    let updatedCount = 0;
    
    // Update each question with the correct image URL
    for (const question of questions) {
      const subject = question.explanation.replace('Correct answer: ', '').replace('.', '');
      const imageName = imageMapping[subject];
      
      if (imageName) {
        // Update the image URL
        question.imageUrl = `/uploads/${imageName}`;
        await question.save();
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} questions with image URLs.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating question images:', error);
    process.exit(1);
  }
}

updateQuestionImages();
