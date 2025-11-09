import dotenv from 'dotenv';
import { sequelize } from '../config/db.js';
import { Question } from '../models/index.js';
import path from 'path';
import fs from 'fs';

dotenv.config();

// Map of filenames to vehicle details
// Categories:
// IDENT1: Armored Personnel Carriers (VBTT)
// IDENT2: Infantry Fighting Vehicles (VBCI)
// IDENT3: Main Battle Tanks
// IDENT5: Helicopters
// IDENT6: Individual Weapons
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
  'T 62.png': {
    name: 'T-62',
    type: 'Main Battle Tank',
    country: 'Soviet Union',
    introduced: '1961',
    category: 'IDENT3',
    description: 'The T-62 is a Soviet main battle tank that was developed as a further development of the T-55 series.'
  },
  'T 64.png': {
    name: 'T-64',
    type: 'Main Battle Tank',
    country: 'Soviet Union',
    introduced: '1966',
    category: 'IDENT3',
    description: 'The T-64 is a Soviet second-generation main battle tank, introduced in the early 1960s.'
  },
  'T 72.png': {
    name: 'T-72',
    type: 'Main Battle Tank',
    country: 'Soviet Union',
    introduced: '1973',
    category: 'IDENT3',
    description: 'The T-72 is a Soviet second-generation main battle tank that entered production in 1971.'
  },
  'T 80.png': {
    name: 'T-80',
    type: 'Main Battle Tank',
    country: 'Soviet Union',
    introduced: '1976',
    category: 'IDENT3',
    description: 'The T-80 is a third-generation main battle tank designed and manufactured in the Soviet Union.'
  },
  'T 90.png': {
    name: 'T-90',
    type: 'Main Battle Tank',
    country: 'Russia',
    introduced: '1992',
    category: 'IDENT3',
    description: 'The T-90 is a Russian third-generation main battle tank that entered service in 1993.'
  },
  
  // Infantry Fighting Vehicles (IDENT2)
  'BMP 1.png': {
    name: 'BMP-1',
    type: 'Infantry Fighting Vehicle',
    country: 'Soviet Union',
    introduced: '1966',
    category: 'IDENT2',
    description: 'The BMP-1 is a Soviet amphibious tracked infantry fighting vehicle, the first of its kind in the world.'
  },
  'BMP 2.png': {
    name: 'BMP-2',
    type: 'Infantry Fighting Vehicle',
    country: 'Soviet Union',
    introduced: '1980',
    category: 'IDENT2',
    description: 'The BMP-2 is a second-generation, amphibious infantry fighting vehicle introduced in the 1980s.'
  },
  'BMP 3.png': {
    name: 'BMP-3',
    type: 'Infantry Fighting Vehicle',
    country: 'Soviet Union',
    introduced: '1987',
    category: 'IDENT2',
    description: 'The BMP-3 is a Soviet and Russian infantry fighting vehicle, successor to the BMP-1 and BMP-2.'
  },
  'BMD 1.png': {
    name: 'BMD-1',
    type: 'Airborne Infantry Fighting Vehicle',
    country: 'Soviet Union',
    introduced: '1969',
    category: 'IDENT2',
    description: 'The BMD-1 is a Soviet amphibious tracked infantry fighting vehicle designed for airborne troops.'
  },
  'BMD 2.png': {
    name: 'BMD-2',
    type: 'Airborne Infantry Fighting Vehicle',
    country: 'Soviet Union',
    introduced: '1985',
    category: 'IDENT2',
    description: 'The BMD-2 is a Soviet airborne infantry fighting vehicle that is a modernized version of the BMD-1.'
  },
  'BMD 3.png': {
    name: 'BMD-3',
    type: 'Airborne Infantry Fighting Vehicle',
    country: 'Soviet Union',
    introduced: '1990',
    category: 'IDENT2',
    description: 'The BMD-3 is a Russian airborne infantry fighting vehicle developed in the late 1980s.'
  },
  
  // Armored Personnel Carriers (IDENT1)
  'BTR 60.png': {
    name: 'BTR-60',
    type: 'Armored Personnel Carrier',
    country: 'Soviet Union',
    introduced: '1960',
    category: 'IDENT1',
    description: 'The BTR-60 is an eight-wheeled amphibious armored personnel carrier developed in the Soviet Union.'
  },
  'BTR 70.png': {
    name: 'BTR-70',
    type: 'Armored Personnel Carrier',
    country: 'Soviet Union',
    introduced: '1976',
    category: 'IDENT1',
    description: 'The BTR-70 is an eight-wheeled armored personnel carrier developed in the Soviet Union in the 1970s.'
  },
  'BTR 80.png': {
    name: 'BTR-80',
    type: 'Armored Personnel Carrier',
    country: 'Soviet Union',
    introduced: '1986',
    category: 'IDENT1',
    description: 'The BTR-80 is an 8×8 wheeled amphibious armored personnel carrier designed in the Soviet Union.'
  },
  'BTR 80 A.png': {
    name: 'BTR-80A',
    type: 'Armored Personnel Carrier',
    country: 'Russia',
    introduced: '1994',
    category: 'IDENT1',
    description: 'The BTR-80A is a Russian 8×8 wheeled amphibious armored personnel carrier, a modernized version of the BTR-80.'
  },
  'BRDM 2.png': {
    name: 'BRDM-2',
    type: 'Amphibious Armored Scout Car',
    country: 'Soviet Union',
    introduced: '1962',
    category: 'IDENT1',
    description: 'The BRDM-2 is an amphibious armored scout car used by Russia and the former Soviet Union.'
  },
  
  // Helicopters (IDENT5)
  'MI-8.png': {
    name: 'Mi-8',
    type: 'Transport/Attack Helicopter',
    country: 'Soviet Union',
    introduced: '1967',
    category: 'IDENT5',
    description: 'The Mil Mi-8 is a medium twin-turbine helicopter, originally designed by the Soviet Union.'
  },
  'MI-24.png': {
    name: 'Mi-24',
    type: 'Attack Helicopter',
    country: 'Soviet Union',
    introduced: '1972',
    category: 'IDENT5',
    description: 'The Mil Mi-24 is a large helicopter gunship, attack helicopter and low-capacity troop transport.'
  },
  'Mi-26.png': {
    name: 'Mi-26',
    type: 'Heavy Transport Helicopter',
    country: 'Soviet Union',
    introduced: '1983',
    category: 'IDENT5',
    description: 'The Mil Mi-26 is a Soviet/Russian heavy transport helicopter, the largest and most powerful helicopter to have gone into series production.'
  },
  'MI-28.png': {
    name: 'Mi-28',
    type: 'Attack Helicopter',
    country: 'Soviet Union/Russia',
    introduced: '1982',
    category: 'IDENT5',
    description: 'The Mil Mi-28 is a Russian all-weather, day-night, military tandem, two-seat anti-armor attack helicopter.'
  },
  'Mi-52.png': {
    name: 'Ka-52',
    type: 'Attack Helicopter',
    country: 'Russia',
    introduced: '1997',
    category: 'IDENT5',
    description: 'The Kamov Ka-52 "Alligator" is a Russian all-weather, two-seat, attack helicopter.'
  },
  
  // Individual Weapons (IDENT6)
  // Individual Weapons (IDENT6)
  'AKM.png': {
    name: 'AKM',
    type: 'Assault Rifle',
    country: 'Soviet Union',
    introduced: '1959',
    category: 'IDENT6',
    description: 'The AKM is a 7.62mm assault rifle designed by Mikhail Kalashnikov, an updated version of the AK-47.'
  },
  'PKM.png': {
    name: 'PKM',
    type: 'General Purpose Machine Gun',
    country: 'Soviet Union',
    introduced: '1961',
    category: 'IDENT6',
    description: 'The PKM is a 7.62mm general-purpose machine gun designed in the Soviet Union.'
  },
  'RPK.png': {
    name: 'RPK',
    type: 'Light Machine Gun',
    country: 'Soviet Union',
    introduced: '1961',
    category: 'IDENT6',
    description: 'The RPK is a 7.62×39mm light machine gun of Soviet design, developed by Mikhail Kalashnikov.'
  },
  'SVD.png': {
    name: 'SVD',
    type: 'Designated Marksman Rifle',
    country: 'Soviet Union',
    introduced: '1963',
    category: 'IDENT6',
    description: 'The SVD is a semi-automatic designated marksman rifle chambered in 7.62×54mmR, designed in the Soviet Union.'
  },
  'RPG 7.png': {
    name: 'RPG-7',
    type: 'Rocket-Propelled Grenade Launcher',
    country: 'Soviet Union',
    introduced: '1961',
    category: 'IDENT6',
    description: 'The RPG-7 is a portable, reusable, unguided, shoulder-launched, anti-tank rocket-propelled grenade launcher.'
  },
  'AGS 17.png': {
    name: 'AGS-17',
    type: 'Automatic Grenade Launcher',
    country: 'Soviet Union',
    introduced: '1971',
    category: 'IDENT6',
    description: 'The AGS-17 is a Soviet automatic grenade launcher that fires 30×29mm grenades.'
  }
};

// Function to create questions for a vehicle
async function createVehicleQuestions(vehicle) {
  try {
    // Normalize the image name to match the files in the uploads directory
    const normalizedImageName = vehicle.imageName.replace(/\s+/g, ' ').trim();
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
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
    const uploadsDir = path.join(process.cwd(), 'uploads');
    
    // Check if uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      console.error('❌ Uploads directory not found:', uploadsDir);
      console.log('Current working directory:', process.cwd());
      console.log('Directory contents:', fs.readdirSync(process.cwd()));
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
