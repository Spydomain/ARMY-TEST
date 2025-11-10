import { sequelize, Question } from '../models/index.js';

async function updateWeaponQuestions() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Update question text for IDENT4 (weapons) to use "weapon" instead of "vehicle"
    const result = await Question.update(
      {
        question_text: sequelize.fn('REPLACE', sequelize.col('question_text'), 'military vehicle', 'military weapon'),
        question_text_fr: sequelize.fn('REPLACE', sequelize.col('question_text_fr'), 'véhicule militaire', 'arme militaire')
      },
      { where: { category: 'IDENT4' } }
    );

    console.log(`Updated ${result[0]} weapon questions`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

updateWeaponQuestions();
