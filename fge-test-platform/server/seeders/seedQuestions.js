import { Question } from '../models/index.js';
import { sequelize } from '../config/db.js';

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
  {
    id: 1078,
    questionText: 'Identify this modernized version of the BTR-80 with a 30mm automatic cannon and improved armor protection.',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-4',
    optionD: 'BTR-90',
    category: 'IDENT1',
    difficulty: 'hard',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A. The BTR-80A is an upgraded version with a 30mm 2A72 automatic cannon and improved armor.'
  },
  {
    id: 2159,
    questionText: 'This amphibious armored personnel carrier has 8 wheels and a distinctive flat rear with two water jets. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BMP-3',
    optionC: 'BRDM-2',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A. The BTR-80A is fully amphibious with two water jets at the rear for propulsion in water.'
  },
  {
    id: 2137,
    questionText: 'Identify this 4x4 amphibious armored scout car with a distinctive boat-shaped hull and conical turret.',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'BMP-1',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'hard',
    correctAnswer: 'A',
    explanation: 'Correct answer: BRDM-2. The BRDM-2 is a 4x4 amphibious scout car with a distinctive boat-shaped hull and conical turret.'
  },
  {
    id: 1057,
    questionText: 'This early Soviet 8x8 APC has twin water jets at the rear and a distinctive flat front with headlights mounted high. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60. The BTR-60 was the first mass-produced 8x8 wheeled APC in the Soviet Union with distinctive high-mounted headlights.'
  },
  {
    id: 2021,
    questionText: 'Identify this modernized 8x8 APC with a more powerful engine, improved armor, and a new turret design compared to its predecessor.',
    optionA: 'BTR-80',
    optionB: 'BTR-70',
    optionC: 'BTR-60',
    optionD: 'BTR-90',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80. The BTR-80 features a more powerful engine, improved armor, and a redesigned turret compared to the BTR-70.'
  },
  {
    id: 1008,
    questionText: 'This 4x4 amphibious armored car has a distinctive boat-shaped hull and is often used for reconnaissance. What is it?',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'BMP-1',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BRDM-2. The BRDM-2 is a 4x4 amphibious armored car primarily used for reconnaissance.'
  },
  {
    id: 2082,
    questionText: 'This modernized BTR-80 variant features a 30mm automatic cannon and improved fire control system. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-90',
    optionD: 'BTR-4',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A. The BTR-80A is equipped with a 30mm 2A72 automatic cannon and improved fire control system.'
  },
  {
    id: 15,
    questionText: 'Identify this 8x8 APC that was developed to replace the BTR-70, featuring improved armor and a more powerful engine.',
    optionA: 'BTR-80A',
    optionB: 'BTR-70',
    optionC: 'BTR-60',
    optionD: 'BTR-90',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A. The BTR-80A was developed as an improved version of the BTR-70 with better protection and mobility.'
  },
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

const seedQuestions = async () => {
  try {
    // Sync all models
    await sequelize.sync({ force: false });
    console.log('Database synced');

    // Create or update questions
    for (const questionData of questions) {
      const [question, created] = await Question.upsert(questionData, {
        returning: true
      });
      
      if (created) {
        console.log(`Created question ${question.id}`);
      } else {
        console.log(`Updated question ${question.id}`);
      }
    }

    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error);
    process.exit(1);
  }
};

// Run the seeder if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  seedQuestions();
}

export default seedQuestions;
