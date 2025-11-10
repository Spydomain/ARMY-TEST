import { sequelize } from '../config/db.js';
import { Question } from '../models/index.js';

async function checkQuestions() {
  try {
    // Test the database connection
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Count questions by category
    const questionCounts = await Question.findAll({
      attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['category']
    });

    console.log('Question counts by category:');
    console.table(questionCounts.map(item => ({
      category: item.category,
      count: item.dataValues.count
    })));

    // Get one question from each category to verify data structure
    for (const category of ['IDENT1', 'IDENT2', 'IDENT3', 'IDENT4', 'IDENT5', 'IDENT6']) {
      const question = await Question.findOne({
        where: { category },
        raw: true
      });
      console.log(`\nSample question for ${category}:`);
      console.log(question);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkQuestions();
