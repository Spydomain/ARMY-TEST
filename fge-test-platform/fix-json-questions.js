const inputData = {
  "success": true,
  "count": 10,
  "data": [
    {
      "id": 1030,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "medium",
      "correctAnswer": "A",
      "explanation": "The BTR-80A is an upgraded version of the BTR-80, featuring a 30mm 2A72 automatic cannon in a small turret."
    },
    {
      "id": 1015,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "hard",
      "correctAnswer": "A",
      "explanation": "The correct answer is BTR-80."
    },
    {
      "id": 1060,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "medium",
      "correctAnswer": "A",
      "explanation": "Correct answer: BTR-70. The BTR-70 is a Soviet 8x8 wheeled armored personnel carrier."
    },
    {
      "id": 2139,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "hard",
      "correctAnswer": "A",
      "explanation": "The BTR-70 is a Soviet 8x8 wheeled armored personnel carrier that entered service in the 1970s."
    },
    {
      "id": 2162,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "medium",
      "correctAnswer": "A",
      "explanation": "The BTR-60 was the first Soviet 8x8 wheeled APC, introduced in the 1960s with a distinctive flat front design."
    },
    {
      "id": 1075,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "medium",
      "correctAnswer": "A",
      "explanation": "The BTR-80A is an upgraded version of the BTR-80, featuring a 30mm 2A72 automatic cannon in a small turret."
    },
    {
      "id": 1066,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "easy",
      "correctAnswer": "A",
      "explanation": "The BTR-60 was the first Soviet 8x8 wheeled APC, introduced in the 1960s with a distinctive flat front design."
    },
    {
      "id": 1056,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "easy",
      "correctAnswer": "A",
      "explanation": "The BTR-60 was the first Soviet 8x8 wheeled APC, introduced in the 1960s with a distinctive flat front design."
    },
    {
      "id": 2005,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "hard",
      "correctAnswer": "A",
      "explanation": "The correct answer is BTR-80."
    },
    {
      "id": 2009,
      "questionText": "Question text missing",
      "optionA": "Option A",
      "optionB": "Option B",
      "optionC": "Option C",
      "optionD": "Option D",
      "category": "IDENT1",
      "difficulty": "easy",
      "correctAnswer": "A",
      "explanation": "The BTR-80A is an upgraded version of the BTR-80, featuring a 30mm 2A72 automatic cannon in a small turret."
    }
  ]
};

// Function to extract vehicle name from explanation
function extractVehicleName(explanation) {
  // Try to find vehicle names in the explanation
  const btr80Match = explanation.match(/BTR-80(?:A)?/);
  if (btr80Match) return btr80Match[0];
  
  const btr70Match = explanation.match(/BTR-70/);
  if (btr70Match) return btr70Match[0];
  
  const btr60Match = explanation.match(/BTR-60/);
  if (btr60Match) return btr60Match[0];
  
  // Default to a generic description if no match found
  return "this military vehicle";
}

// Map vehicle names to their corresponding image filenames in the uploads folder
const vehicleImages = {
  'BTR-80A': '/uploads/BTR 80 A.png',
  'BTR-80': '/uploads/BTR 80.png',
  'BTR-70': '/uploads/BTR 70.png',
  'BTR-60': '/uploads/BTR 60.png',
  'BMP-1': '/uploads/BMP 1.png',
  'BMP-2': '/uploads/BMP 2.png',
  'BMP-3': '/uploads/BMP 3.png',
  'T-72': '/uploads/T 72.png',
  'T-80': '/uploads/T 80.png',
  'T-90': '/uploads/T 90.png',
  'BRDM-2': '/uploads/BRDM 2.png',
  'MI-8': '/uploads/MI-8.png',
  'MI-24': '/uploads/MI-24.png',
  'MI-28': '/uploads/MI-28.png',
  'MI-26': '/uploads/MI-26.png',
  'PKM': '/uploads/PKM.png',
  'RPK': '/uploads/RPK.png',
  'SVD': '/uploads/SVD.png',
  'RPG-7': '/uploads/RPG 7.png',
  'AKM': '/uploads/AKM.png'
};

// Function to generate question text with image based on vehicle name
function generateQuestionText(vehicleName, difficulty) {
  const questions = {
    'BTR-80A': '![BTR-80A](' + vehicleImages['BTR-80A'] + ')\n\nThis 8x8 wheeled APC features a 30mm automatic cannon in a small turret and is a modernized version of the BTR-80. What is it?',
    'BTR-80': '![BTR-80](' + vehicleImages['BTR-80'] + ')\n\nThis 8x8 wheeled APC is widely used by Russian forces and features a 14.5mm KPVT heavy machine gun. What is it?',
    'BTR-70': '![BTR-70](' + vehicleImages['BTR-70'] + ')\n\nThis 8x8 wheeled APC was developed in the 1970s and features a conical turret with a 14.5mm KPVT heavy machine gun. What is it?',
    'BTR-60': '![BTR-60](' + vehicleImages['BTR-60'] + ')\n\nThis 8x8 wheeled APC was the first of its kind in the Soviet Union, featuring a distinctive flat front and high-mounted headlights. What is it?'
  };

  // Return specific question if available, otherwise generate a generic one
  return questions[vehicleName] || `This military vehicle is a ${vehicleName}. Can you identify it?`;
}

// Process the data
const fixedData = {
  ...inputData,
  data: inputData.data.map(question => {
    const vehicleName = extractVehicleName(question.explanation);
    return {
      ...question,
      questionText: generateQuestionText(vehicleName, question.difficulty),
      optionA: vehicleName,
      optionB: 'BMP-2',
      optionC: 'T-72',
      optionD: 'MT-LB',
      correctAnswer: 'A' // Since we're putting the correct answer in optionA
    };
  })
};

console.log(JSON.stringify(fixedData, null, 2));
