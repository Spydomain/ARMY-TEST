import { Question } from '../models/index.js';
import { sequelize } from '../config/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const questions = [
  {
    id: 2109,
    questionText: 'Identify this 8x8 wheeled armored personnel carrier with a distinctive sloped front and small turret with 14.5mm KPVT machine gun.',
    optionA: 'BTR-70',
    optionB: 'BMP-2',
    optionC: 'MT-LB',
    optionD: 'BTR-80',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-70. The BTR-70 is a Soviet 8x8 wheeled armored personnel carrier with a distinctive sloped front and a small turret.'
  },
  // ... [other questions remain the same as in seedQuestions.js]
  {
    id: 2030,
    questionText: 'This early Soviet 8x8 APC was the first of its kind to enter mass production. It has a distinctive flat front and high-mounted headlights. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60. The BTR-60 was the first mass-produced 8x8 wheeled APC in the Soviet Union, introduced in 1959.'
  }
];

const seedProduction = async () => {
  console.log('🚀 Starting production database seeding...');
  
  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync all models
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: false });
    
    // Create or update questions
    console.log('📝 Seeding questions...');
    for (const questionData of questions) {
      const [question, created] = await Question.upsert(questionData, {
        returning: true
      });
      
      console.log(created ? `✅ Created` : `🔄 Updated`, `question ${question.id}`);
    }

    console.log('🎉 Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

// Run the seeder if this file is executed directly
if (process.env.NODE_ENV === 'production' || process.argv[1] === new URL(import.meta.url).pathname) {
  seedProduction();
}

export default seedProduction;
