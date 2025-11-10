import dotenv from 'dotenv';
import { sequelize } from '../config/db.js';
import { Question } from '../models/index.js';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Map of filenames to vehicle details
const VEHICLE_DETAILS = {
  // Main Battle Tanks (IDENT3)
  'T 54 55.png': {
    name: 'T-54/55',
    type: 'Main Battle Tank',
    country: 'Soviet Union',
    introduced: '1949',
    category: 'IDENT3',
    description: 'The T-54/55 is a series of Soviet main battle tanks that were first introduced in the years following World War II.'
  },
  // ... (rest of your VEHICLE_DETAILS object)
};

// Function to create questions for a vehicle
async function createVehicleQuestions(vehicle) {
  try {
    // Normalize the image name to match the files in the uploads directory
    const normalizedImageName = vehicle.imageName.replace(/\s+/g, ' ').trim();
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
    
    // Read the uploads directory to find the exact filename (case-insensitive)
    const files = fs.readdirSync(uploadsDir);
    const matchingFile = files.find(file => 
      file.toLowerCase() === normalizedImageName.toLowerCase() ||
      file.toLowerCase().replace(/[\s-]/g, '') === normalizedImageName.toLowerCase().replace(/[\s-]/g, '')
    );
    
    if (!matchingFile) {
      console.error(`❌ Image not found for: ${normalizedImageName}`);
      console.log('Available files in uploads directory:', files);
      return; // Skip this vehicle if image is missing
    }
    
    console.log(`✅ Found matching image: ${matchingFile} (original: ${normalizedImageName})`);
    
    // Store just the filename, the model will prepend /uploads/
    const imageUrl = matchingFile;
    
    // Create multiple questions for each vehicle
    const questions = [
      {
        questionText: `Identify this military vehicle: ${vehicle.imageName.replace(/\.\w+$/, '')}`,
        questionTextFr: `Identifiez ce véhicule militaire: ${vehicle.imageName.replace(/\.\w+$/, '')}`,
        optionA: vehicle.name,
        optionB: getRandomVehicleName(vehicle.name, vehicle.category),
        optionC: getRandomVehicleType(vehicle.type),
        optionD: 'Military Vehicle',
        correctAnswer: 'A',
        explanation: `This is a ${vehicle.name}, which is a ${vehicle.type}.`,
        explanationFr: `Ceci est un ${vehicle.name}, qui est un ${vehicle.type}.`,
        category: vehicle.category,
        difficulty: getRandomDifficulty(),
        imageUrl: imageUrl
      },
      {
        questionText: `What type of military vehicle is the ${vehicle.name}?`,
        questionTextFr: `Quel type de véhicule militaire est le ${vehicle.name}?`,
        optionA: vehicle.type,
        optionB: getRandomVehicleType(vehicle.type),
        optionC: getRandomVehicleType(vehicle.type),
        optionD: getRandomVehicleType(vehicle.type),
        correctAnswer: 'A',
        explanation: `The ${vehicle.name} is classified as a ${vehicle.type.toLowerCase()}.`,
        explanationFr: `Le ${vehicle.name} est classé comme ${vehicle.type.toLowerCase()}.`,
        category: vehicle.category,
        difficulty: getRandomDifficulty(),
        imageUrl
      },
      {
        questionText: `In what year was the ${vehicle.name} introduced?`,
        questionTextFr: `En quelle année le ${vehicle.name} a-t-il été introduit?`,
        optionA: vehicle.introduced,
        optionB: (parseInt(vehicle.introduced) + Math.floor(Math.random() * 10) + 1).toString(),
        optionC: (parseInt(vehicle.introduced) - Math.floor(Math.random() * 10) - 1).toString(),
        optionD: (parseInt(vehicle.introduced) + (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 5) + 1)).toString(),
        correctAnswer: 'A',
        explanation: `The ${vehicle.name} was introduced in ${vehicle.introduced}.`,
        explanationFr: `Le ${vehicle.name} a été introduit en ${vehicle.introduced}.`,
        category: vehicle.category,
        difficulty: getRandomDifficulty(),
        imageUrl
      }
    ];

    // Add the questions to the database
    for (const question of questions) {
      // Randomize the order of options
      const options = [
        { text: question.optionA, isCorrect: true },
        { text: question.optionB, isCorrect: false },
        { text: question.optionC, isCorrect: false },
        { text: question.optionD, isCorrect: false }
      ];
      
      // Shuffle options
      shuffleArray(options);
      
      // Find the index of the correct answer
      const correctIndex = options.findIndex(opt => opt.isCorrect);
      const correctAnswer = String.fromCharCode(65 + correctIndex); // Convert to A, B, C, or D
      
      try {
        const createdQuestion = await Question.create({
          questionText: question.questionText,
          questionTextFr: question.questionTextFr,
          optionA: options[0].text,
          optionB: options[1].text,
          optionC: options[2].text,
          optionD: options[3].text,
          correctAnswer,
          explanation: question.explanation,
          explanationFr: question.explanationFr,
          category: question.category,
          difficulty: question.difficulty,
          imageUrl: question.imageUrl
        });
        
        console.log(`✅ Added question for ${vehicle.name}: ${question.questionText}`);
        console.log(`   Image URL: ${createdQuestion.imageUrl}`);
      } catch (error) {
        console.error(`Error adding question for ${vehicle.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error(`Error in createVehicleQuestions for ${vehicle.name}:`, error);
  }
}

// Helper function to get a random vehicle name (excluding the current one)
function getRandomVehicleName(currentName, category) {
  const vehicles = Object.values(VEHICLE_DETAILS)
    .filter(v => v.name !== currentName && v.category === category)
    .map(v => v.name);
  return vehicles[Math.floor(Math.random() * vehicles.length)] || 'Unknown Vehicle';
}

// Helper function to get a random vehicle type (excluding the current one)
function getRandomVehicleType(currentType) {
  const types = [...new Set(Object.values(VEHICLE_DETAILS).map(v => v.type))]
    .filter(t => t !== currentType);
  return types[Math.floor(Math.random() * types.length)] || 'Military Vehicle';
}

// Helper function to get a random difficulty
function getRandomDifficulty() {
  const difficulties = ['easy', 'medium', 'hard'];
  return difficulties[Math.floor(Math.random() * difficulties.length)];
}

// Helper function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Main function to seed the database
async function seedDatabase() {
  try {
    // Connect to the database
    await sequelize.authenticate();
    console.log('✅ Connected to the database.');
    
    // Sync the models with force:true to reset the database
    console.log('🔄 Syncing database...');
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');
    
    // Process each vehicle image
    const uploadsDir = path.join(process.cwd(), 'server', 'uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.error('❌ Uploads directory not found:', uploadsDir);
      process.exit(1);
    }
    
    console.log(`📂 Found uploads directory: ${uploadsDir}`);
    
    // Get all vehicle entries
    const vehicleEntries = Object.entries(VEHICLE_DETAILS);
    console.log(`🚗 Found ${vehicleEntries.length} vehicles to process`);
    
    // Process each vehicle
    for (const [imageName, vehicle] of vehicleEntries) {
      await createVehicleQuestions({
        ...vehicle,
        imageName
      });
    }
    
    console.log('\n🎉 Database seeding complete!');
    
    // Verify the questions were added
    const questionCount = await Question.count();
    console.log(`📊 Total questions in database: ${questionCount}`);
    
    if (questionCount > 0) {
      // Show a few sample questions
      const sampleQuestions = await Question.findAll({ 
        limit: 3,
        attributes: ['id', 'questionText', 'imageUrl', 'category']
      });
      
      console.log('\nSample questions:');
      sampleQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. [${q.category}] ${q.questionText}`);
        console.log(`     Image URL: ${q.imageUrl}\n`);
      });
    } else {
      console.log('\n❌ No questions were added to the database');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error in seedDatabase:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();
