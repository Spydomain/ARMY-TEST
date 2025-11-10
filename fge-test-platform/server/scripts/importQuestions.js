import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { Question } from '../models/index.js';
import { sequelize } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOADS_DIR = join(__dirname, '..', 'uploads');

// Vehicle categories and their details
const VEHICLE_CATEGORIES = {
  'BTR': { category: 'IDENT1', type: 'Armored Personnel Carrier' },
  'BRDM': { category: 'IDENT1', type: 'Armored Scout Car' },
  'BMP': { category: 'IDENT2', type: 'Infantry Fighting Vehicle' },
  'BMD': { category: 'IDENT2', type: 'Airborne Infantry Fighting Vehicle' },
  'T-': { category: 'IDENT3', type: 'Main Battle Tank' },
  'T ': { category: 'IDENT3', type: 'Main Battle Tank' }
};

// Get vehicle info from filename
function getVehicleInfo(filename) {
  for (const [prefix, info] of Object.entries(VEHICLE_CATEGORIES)) {
    if (filename.startsWith(prefix)) {
      return info;
    }
  }
  return { category: 'IDENT6', type: 'Military Vehicle' };
}

// Generate options based on vehicle type
function generateOptions(vehicleType) {
  const options = {
    'Armored Personnel Carrier': ['BTR-80', 'BTR-70', 'BTR-60', 'BTR-90'],
    'Armored Scout Car': ['BRDM-2', 'BRDM-1', 'BRDM-3', 'BRMSH'],
    'Infantry Fighting Vehicle': ['BMP-2', 'BMP-1', 'BMP-3', 'BMP-23'],
    'Airborne Infantry Fighting Vehicle': ['BMD-2', 'BMD-1', 'BMD-3', 'BMD-4'],
    'Main Battle Tank': ['T-72', 'T-80', 'T-90', 'T-14 Armata'],
    'Military Vehicle': ['Tank', 'APC', 'IFV', 'Scout Vehicle']
  };
  
  return options[vehicleType] || options['Military Vehicle'];
}

// Main function to import questions
async function importQuestions() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');
    
    // Drop and recreate tables to ensure clean state
    console.log('Dropping and recreating tables...');
    await sequelize.sync({ force: true });
    
    // Read all files from uploads directory
    const files = fs.readdirSync(UPLOADS_DIR);
    const imageFiles = files.filter(file => {
      const ext = file.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif'].includes(ext);
    });
    
    if (imageFiles.length === 0) {
      console.log('No image files found in uploads directory');
      return;
    }
    
    console.log(`Found ${imageFiles.length} image files`);
    
    // Process each image file
    for (const filename of imageFiles) {
      try {
        const vehicleInfo = getVehicleInfo(filename);
        let options = generateOptions(vehicleInfo.type);
        const modelMatch = filename.match(/([A-Za-z]+-?\d+[A-Za-z]*)/);
        const correctAnswer = modelMatch ? modelMatch[1] : vehicleInfo.type;
        
        // Ensure options are unique and don't exceed 4
        options = [...new Set(options)].slice(0, 4);
        
        // Find the index of the correct answer in options
        let correctIndex = options.findIndex(opt => opt === correctAnswer);
        if (correctIndex === -1) {
          // If correct answer not in options, replace a random option
          const randomIndex = Math.floor(Math.random() * options.length);
          options[randomIndex] = correctAnswer;
          correctIndex = randomIndex;
        }
        
        // Map index to A, B, C, D
        const correctAnswerLetter = String.fromCharCode(65 + correctIndex); // 65 is 'A' in ASCII
        
        // Read image file
        const imagePath = join(UPLOADS_DIR, filename);
        const imageBuffer = fs.readFileSync(imagePath);
        
        // Create question in database
        await Question.create({
          questionText: `Identify this military vehicle: ${filename.split('.')[0]}`,
          questionTextFr: `Identifiez ce véhicule militaire: ${filename.split('.')[0]}`,
          optionA: options[0] || 'Option A',
          optionB: options[1] || 'Option B',
          optionC: options[2] || 'Option C',
          optionD: options[3] || 'Option D',
          correctAnswer: correctAnswerLetter, // A, B, C, or D
          image: imageBuffer,
          category: vehicleInfo.category,
          difficulty: vehicleInfo.category === 'IDENT6' ? 'easy' : 
                     vehicleInfo.category === 'IDENT3' ? 'hard' : 'medium',
          explanation: `This is a ${correctAnswer}, which is a ${vehicleInfo.type}.`,
          explanationFr: `Ceci est un ${correctAnswer}, qui est un ${vehicleInfo.type}.`
        });
        
        console.log(`✅ Created question for ${filename}`);
      } catch (error) {
        console.error(`❌ Error processing ${filename}:`, error.message);
      }
    }
    
    console.log('\n🎉 Import completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

// Run the import
importQuestions();
