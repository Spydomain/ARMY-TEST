import { sequelize } from './config/db.js';
import { Question } from './models/index.js';

async function testAPI() {
  try {
    await sequelize.authenticate();
    console.log('DB connected');

    const questions = await Question.findAll({
      where: { category: 'IDENT1' },
      order: sequelize.random(),
      limit: 10,
      raw: true
    });

    console.log('Questions found:', questions.length);
    questions.forEach((q, i) => {
      console.log(`Q${i+1}: id=${q.id}, imageUrl='${q.imageUrl}'`);
    });

    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

testAPI();
