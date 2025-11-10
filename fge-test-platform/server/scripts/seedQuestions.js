import dotenv from 'dotenv';
import { sequelize } from '../config/db.js';
import { Question } from '../models/index.js';

dotenv.config();

const CATEGORIES = {
  IDENT1: [
    'BTR-60', 'BTR-70', 'BRDM-2', 'BTR-80', 'BTR-80A'
  ],
  IDENT2: [
    'BMP-1', 'BMP-2', 'BMP-3', 'BMD-1', 'BMD-2', 'BMD-3'
  ],
  IDENT3: [
    'T-54/55', 'T-62', 'T-64', 'T-72', 'T-80', 'T-90'
  ],
  IDENT4: [
    'AK-47', 'AKM', 'AK-74', 'RPK', 'PKM', 'SVD', 'RPG-7', 'AGS-17'
  ],
  IDENT5: [
    'Mi-8/17', 'Mi-24', 'Mi-26', 'Mi-28', 'Ka-52'
  ],
  IDENT6: [] // Mixed pool filled later
};
CATEGORIES.IDENT6 = [
  ...CATEGORIES.IDENT1,
  ...CATEGORIES.IDENT2,
  ...CATEGORIES.IDENT3,
  ...CATEGORIES.IDENT4,
  ...CATEGORIES.IDENT5,
];

const DIFFICULTIES = ['easy', 'medium', 'hard'];

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sample(array, n) {
  const copy = [...array];
  const out = [];
  n = Math.min(n, copy.length);
  for (let i = 0; i < n; i++) {
    const idx = randInt(0, copy.length - 1);
    out.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return out;
}

function pick(array) {
  return array[randInt(0, array.length - 1)];
}

function makeQuestionRecord(category, subject) {
  // Build four options from the category pool (ensure the subject is included)
  const pool = CATEGORIES[category];
  const otherChoices = sample(pool.filter((p) => p !== subject), 3);
  const options = [...otherChoices, subject];
  // Shuffle options
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  const correctIndex = options.findIndex((o) => o === subject);
  const answerKey = ['A', 'B', 'C', 'D'][correctIndex];

  const templatesEn = [
    `Identify the following: ${subject}`,
    `Which of the following best matches: ${subject}?`,
    `Select the correct identification for: ${subject}`,
  ];
  const templatesFr = [
    `Identifiez l'élément suivant : ${subject}`,
    `Laquelle des propositions correspond le mieux à : ${subject} ?`,
    `Sélectionnez l'identification correcte pour : ${subject}`,
  ];

  return {
    category,
    questionText: pick(templatesEn),
    questionTextFr: pick(templatesFr),
    optionA: options[0],
    optionB: options[1],
    optionC: options[2],
    optionD: options[3],
    correctAnswer: answerKey,
    imageUrl: null,
    difficulty: pick(DIFFICULTIES),
    explanation: `Correct answer: ${subject}.`,
    explanationFr: `Bonne réponse : ${subject}.`,
  };
}

async function seed({ total = 1000 } = {}) {
  // Evenly distribute by category (IDENT1..IDENT6)
  const cats = ['IDENT1', 'IDENT2', 'IDENT3', 'IDENT4', 'IDENT5', 'IDENT6'];
  const perCat = Math.floor(total / cats.length);
  const remainder = total % cats.length;

  const records = [];
  cats.forEach((cat, idx) => {
    const count = perCat + (idx < remainder ? 1 : 0);
    for (let i = 0; i < count; i++) {
      const pool = CATEGORIES[cat];
      const subject = pick(pool);
      records.push(makeQuestionRecord(cat, subject));
    }
  });

  console.log(`Seeding ${records.length} questions...`);
  await Question.bulkCreate(records, { validate: true });
  console.log('Seeding complete.');
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log('DB connected.');
    await seed({ total: 1000 });
  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
})();
