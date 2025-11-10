import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { Question } from '../models/index.js';
import { sequelize } from '../config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const UPLOADS_DIR = join(__dirname, '..', 'uploads');

// Check if uploads directory exists and has files
const checkUploadsDir = () => {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      console.log(`⚠️ Uploads directory not found at: ${UPLOADS_DIR}`);
      return false;
    }
    
    const files = fs.readdirSync(UPLOADS_DIR);
    if (files.length === 0) {
      console.log('ℹ️ No files found in uploads directory, skipping import');
      return false;
    }
    
    console.log(`✅ Found ${files.length} files in uploads directory`);
    return true;
  } catch (error) {
    console.error('❌ Error checking uploads directory:', error);
    return false;
  }
};

// Map filename prefixes to categories with detailed information
const VEHICLE_CATEGORIES = {
  // Armored Personnel Carriers
  'BTR': {
    category: 'IDENT1',
    type: 'Armored Personnel Carrier',
    description: 'A wheeled amphibious armored personnel carrier',
    options: ['BTR-60', 'BTR-70', 'BTR-80', 'BTR-90', 'BTR-4']
  },
  'BRDM': {
    category: 'IDENT1',
    type: 'Armored Scout Car',
    description: 'An amphibious armored scout car',
    options: ['BRDM-1', 'BRDM-2', 'BRDM-3', 'BRMSH', 'BRDM-2M']
  },
  // Infantry Fighting Vehicles
  'BMP': {
    category: 'IDENT2',
    type: 'Infantry Fighting Vehicle',
    description: 'A tracked infantry fighting vehicle',
    options: ['BMP-1', 'BMP-2', 'BMP-3', 'BMP-23', 'BMP-30']
  },
  'BMD': {
    category: 'IDENT2',
    type: 'Airborne Infantry Fighting Vehicle',
    description: 'An airborne infantry fighting vehicle',
    options: ['BMD-1', 'BMD-2', 'BMD-3', 'BMD-4', 'BMD-4M']
  },
  // Main Battle Tanks
  'T-': {
    category: 'IDENT3',
    type: 'Main Battle Tank',
    description: 'A main battle tank',
    options: ['T-54', 'T-55', 'T-62', 'T-64', 'T-72', 'T-80', 'T-90', 'T-14 Armata']
  },
  'T ': {
    category: 'IDENT3',
    type: 'Main Battle Tank',
    description: 'A main battle tank',
    options: ['T-54', 'T-55', 'T-62', 'T-64', 'T-72', 'T-80', 'T-90', 'T-14 Armata']
  }
};

// Default category for unmatched files
const DEFAULT_CATEGORY = {
  category: 'IDENT6',
  type: 'Military Vehicle',
  description: 'A military vehicle',
  options: ['Tank', 'APC', 'IFV', 'Scout Vehicle', 'Armored Car']
};

// Function to get vehicle info from filename
function getVehicleInfo(filename) {
  for (const [prefix, info] of Object.entries(VEHICLE_CATEGORIES)) {
    if (filename.startsWith(prefix)) {
      return { ...info };
    }
  }
  return { ...DEFAULT_CATEGORY };
}

// Function to generate question text from filename
function generateQuestionText(filename) {
  const name = filename.replace(/\.[^/.]+$/, ''); // Remove extension
  return `Identify this military vehicle: ${name}`;
}

// Function to generate options based on vehicle type
function generateOptions(vehicleInfo, correctAnswer) {
  // Start with the correct options for this vehicle type
  let options = [...vehicleInfo.options];
  
  // Remove the correct answer if it's in the options
  options = options.filter(opt => opt !== correctAnswer);
  
  // Shuffle the options
  options = options.sort(() => 0.5 - Math.random());
  
  // Take first 3 wrong options
  const wrongOptions = options.slice(0, 3);
  
  // Add the correct answer and shuffle again
  const allOptions = [...wrongOptions, correctAnswer];
  return allOptions.sort(() => 0.5 - Math.random());
}

// Function to determine correct answer from filename
function getCorrectAnswer(filename) {
  // Extract base name without extension
  const baseName = filename.split('.')[0];
  const vehicleInfo = getVehicleInfo(filename);
  
  // Try to extract specific model from filename (e.g., "BMP-2.png" -> "BMP-2")
  const modelMatch = baseName.match(/([A-Za-z]+-?\d+[A-Za-z]*)/);
  
  let correctAnswer;
  if (modelMatch) {
    // If we found a model number, use it
    correctAnswer = modelMatch[1];
  } else {
    // Otherwise use the vehicle type as fallback
    correctAnswer = vehicleInfo.type;
  }
  
  // Generate options for this vehicle type
  const options = generateOptions(vehicleInfo, correctAnswer);
  
  return {
    correctAnswer,
    options,
    type: vehicleInfo.type,
    description: vehicleInfo.description
  };
}

// Main import function
const importImages = async () => {
  try {
    console.log('\n🔄 Starting image import process...');
    
    // Check if uploads directory exists and has files
    if (!checkUploadsDir()) {
      console.log('ℹ️ Skipping image import');
      return { success: true, message: 'No images to import' };
    }
    
    const files = fs.readdirSync(UPLOADS_DIR);
    const imageFiles = files.filter(file => 
      file.match(/\.(jpg|jpeg|png|gif)$/i)
    );

    console.log(`📸 Found ${imageFiles.length} image files to process`);
    
    // Process each image file
    for (const file of imageFiles) {
      try {
        const filePath = join(UPLOADS_DIR, file);
        
        // Get vehicle information and generate question
        const { correctAnswer, options, type, description } = getCorrectAnswer(file);
        const vehicleInfo = getVehicleInfo(file);
        
        // Read image file as buffer
        const imageBuffer = fs.readFileSync(filePath);
        
        // Create question text
        const questionText = `Identify this ${type.toLowerCase()}:`;
        
        // Create explanation
        const explanation = `This is a ${correctAnswer}, which is a ${description}. ` +
                          `It is categorized as ${vehicleInfo.category} in the identification system.`;
        
        // Determine difficulty based on category
        const difficulty = vehicleInfo.category === 'IDENT6' ? 'easy' : 
                          vehicleInfo.category === 'IDENT3' ? 'hard' : 'medium';
        
        // Create or update question in database
        await Question.upsert({
          questionText,
          options,
          correctAnswer,
          category: vehicleInfo.category,
          image: imageBuffer,
          difficulty,
          explanation,
          imageFileName: file
        });
        
        console.log(`✅ Created question for ${file}: ${correctAnswer} (${vehicleInfo.category})`);
      } catch (fileError) {
        console.error(`❌ Error processing file ${file}:`, fileError.message);
      }
    }
    
    console.log('🎉 Image import process completed successfully!');
    return { success: true, processed: imageFiles.length };
    
  } catch (error) {
    console.error('❌ Error in importImages:', error);
    return { success: false, error: error.message };
  }
};

// Export the importImages function
export default importImages;
