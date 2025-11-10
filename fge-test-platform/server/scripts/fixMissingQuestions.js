import { Question } from '../models/index.js';
import { sequelize } from '../config/db.js';

const questionsToUpdate = [
  {
    id: 2057,
    questionText: 'This 8x8 wheeled APC features a 30mm automatic cannon in a small turret and is a modernized version of the BTR-80. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-90',
    optionD: 'BTR-4',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A.',
    imageUrl: 'BTR 80A.png'
  },
  {
    id: 144,
    questionText: 'Identify this 8x8 wheeled APC that was the first of its kind in the Soviet Union, featuring a distinctive flat front and high-mounted headlights.',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'hard',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60.',
    imageUrl: 'BTR 60.png'
  },
  {
    id: 2095,
    questionText: 'This modernized 8x8 APC features a 30mm automatic cannon and improved fire control system. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-90',
    optionD: 'BTR-4',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A.',
    imageUrl: 'BTR 80A.png'
  },
  {
    id: 97,
    questionText: 'This 8x8 wheeled APC was the first of its kind in the Soviet Union, featuring a distinctive flat front and high-mounted headlights. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60.',
    imageUrl: 'BTR 60.png'
  },
  {
    id: 2010,
    questionText: 'Identify this 4x4 amphibious armored scout car with a distinctive boat-shaped hull and conical turret.',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'BMP-1',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BRDM-2.',
    imageUrl: 'BRDM 2.png'
  },
  {
    id: 2160,
    questionText: 'This was the first mass-produced 8x8 wheeled APC in the Soviet Union, introduced in 1959. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60.',
    imageUrl: 'BTR 60.png'
  },
  {
    id: 2022,
    questionText: 'This modernized 8x8 APC features a 30mm automatic cannon and improved armor protection. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-90',
    optionD: 'BTR-4',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A.',
    imageUrl: 'BTR 80A.png'
  },
  {
    id: 2122,
    questionText: 'Identify this 4x4 amphibious armored vehicle with a distinctive boat-shaped hull, often used for reconnaissance.',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'BMP-1',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BRDM-2.',
    imageUrl: 'BRDM 2.png'
  },
  {
    id: 1065,
    questionText: 'This 8x8 APC features a 30mm automatic cannon and is a modernized version of the BTR-80. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-90',
    optionD: 'BTR-4',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A.',
    imageUrl: 'BTR 80A.png'
  },
  {
    id: 124,
    questionText: 'This 8x8 wheeled APC features improved mobility and protection over its predecessor, the BTR-70. What is it?',
    optionA: 'BTR-80',
    optionB: 'BTR-70',
    optionC: 'BTR-60',
    optionD: 'BTR-90',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80.',
    imageUrl: 'BTR 80.png'
  },
  {
    id: 51,
    questionText: 'This 8x8 wheeled APC was the first of its kind in the Soviet Union, featuring a distinctive flat front and high-mounted headlights. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'hard',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60. The BTR-60 was the first mass-produced 8x8 wheeled APC in the Soviet Union, introduced in 1959.',
    imageUrl: 'BTR 60.png'
  },
  {
    id: 2078,
    questionText: 'Identify this 4x4 amphibious armored scout car with a distinctive boat-shaped hull and conical turret.',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'BMP-1',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BRDM-2. The BRDM-2 is a 4x4 amphibious scout car with a distinctive boat-shaped hull and conical turret.',
    imageUrl: 'BRDM 2.png'
  },
  {
    id: 1072,
    questionText: 'This modernized 8x8 APC features a more powerful engine and improved armor compared to its predecessor. What is it?',
    optionA: 'BTR-80',
    optionB: 'BTR-70',
    optionC: 'BTR-60',
    optionD: 'BTR-90',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80. The BTR-80 is an improved version of the BTR-70 with better mobility and protection.',
    imageUrl: 'BTR 80.png'
  },
  {
    id: 27,
    questionText: 'Identify this 8x8 wheeled APC with a distinctive sloped front and small turret mounting a 14.5mm KPVT machine gun.',
    optionA: 'BTR-70',
    optionB: 'BMP-2',
    optionC: 'MT-LB',
    optionD: 'BTR-80',
    category: 'IDENT1',
    difficulty: 'hard',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-70. The BTR-70 is a Soviet 8x8 wheeled armored personnel carrier with a distinctive sloped front.',
    imageUrl: 'BTR 70.png'
  },
  {
    id: 2032,
    questionText: 'This early Soviet 8x8 APC has twin water jets at the rear and a distinctive flat front. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60. The BTR-60 was the first mass-produced 8x8 wheeled APC in the Soviet Union.',
    imageUrl: 'BTR 60.png'
  },
  {
    id: 1037,
    questionText: 'This 4x4 amphibious armored car has a distinctive boat-shaped hull and is often used for reconnaissance. What is it?',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'BMP-1',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BRDM-2. The BRDM-2 is a 4x4 amphibious armored car primarily used for reconnaissance.',
    imageUrl: 'BRDM 2.png'
  },
  {
    id: 2036,
    questionText: 'Identify this 4x4 amphibious scout car with a distinctive conical turret and boat-shaped hull.',
    optionA: 'BRDM-2',
    optionB: 'BTR-60',
    optionC: 'BMP-1',
    optionD: 'MT-LB',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BRDM-2. The BRDM-2 is a 4x4 amphibious scout car with a distinctive conical turret.',
    imageUrl: 'BRDM 2.png'
  },
  {
    id: 1109,
    questionText: 'This modernized BTR-80 variant features a 30mm automatic cannon. What is it?',
    optionA: 'BTR-80A',
    optionB: 'BTR-82A',
    optionC: 'BTR-90',
    optionD: 'BTR-4',
    category: 'IDENT1',
    difficulty: 'easy',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-80A. The BTR-80A is equipped with a 30mm 2A72 automatic cannon.',
    imageUrl: 'BTR 80 A.png'
  },
  {
    id: 6,
    questionText: 'This early Soviet 8x8 APC was the first of its kind to enter mass production. What is it?',
    optionA: 'BTR-60',
    optionB: 'BTR-70',
    optionC: 'BTR-80',
    optionD: 'BMP-1',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-60. The BTR-60 was the first mass-produced 8x8 wheeled APC in the Soviet Union.',
    imageUrl: 'BTR 60.png'
  },
  {
    id: 1060,
    questionText: 'Identify this 8x8 wheeled APC with a distinctive sloped front and small turret.',
    optionA: 'BTR-70',
    optionB: 'BMP-2',
    optionC: 'MT-LB',
    optionD: 'BTR-80',
    category: 'IDENT1',
    difficulty: 'medium',
    correctAnswer: 'A',
    explanation: 'Correct answer: BTR-70. The BTR-70 is a Soviet 8x8 wheeled armored personnel carrier.',
    imageUrl: 'BTR 70.png'
  }
];

const fixMissingQuestions = async () => {
  console.log('🚀 Starting to fix missing question texts...');
  
  try {
    // Test database connection first
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    let successCount = 0;
    
    // Update each question
    for (const questionData of questionsToUpdate) {
      try {
        const [updatedCount] = await Question.update(questionData, {
          where: { id: questionData.id },
          returning: true
        });
        
        if (updatedCount > 0) {
          console.log(`✅ Updated question ${questionData.id}`);
          successCount++;
        } else {
          console.log(`⚠️  Question ${questionData.id} not found`);
        }
      } catch (error) {
        console.error(`❌ Error updating question ${questionData.id}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully updated ${successCount} out of ${questionsToUpdate.length} questions`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during question update:', error);
    process.exit(1);
  }
};

// Run the fix if this file is executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  fixMissingQuestions();
}

export default fixMissingQuestions;
