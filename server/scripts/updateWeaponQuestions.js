import { sequelize, Question } from '../models/index.js';

async function updateWeaponQuestions() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Update question text for IDENT4 (weapons) to use "weapon" instead of "vehicle"
    const result = await Question.update(
      {
        questionText: sequelize.fn('REPLACE', sequelize.col('questionText'), 'military vehicle', 'military weapon'),
        questionTextFr: sequelize.fn('REPLACE', sequelize.col('questionTextFr'), 'véhicule militaire', 'arme militaire')
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
