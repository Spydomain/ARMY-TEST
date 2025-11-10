import { sequelize, Question } from '../models/index.js';
import { Op } from 'sequelize';

async function moveWeaponsToIdent4() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Move weapon questions from IDENT6 to IDENT4
    const weapons = ['AKM', 'SVD', 'PKM', 'RPK', 'RPG-7', 'AGS-17'];

    for (const weapon of weapons) {
      const result = await Question.update(
        { category: 'IDENT4' },
        { where: { category: 'IDENT6', questionText: { [Op.like]: `%${weapon}%` } } }
      );
      console.log(`Moved ${weapon} to IDENT4: ${result[0]} rows affected`);
    }

    console.log('Categories updated successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

moveWeaponsToIdent4();
