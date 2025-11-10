import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Question = sequelize.define('Question', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  category: {
    type: DataTypes.ENUM(
      'IDENT1', // Armored Personnel Carriers (VBTT)
      'IDENT2', // Infantry Fighting Vehicles (VBCI)
      'IDENT3', // Main Battle Tanks
      'IDENT4', // Individual Weapons (AK, RPG, etc.)
      'IDENT5', // Helicopters
      'IDENT6'  // Final Revision Test
    ),
    allowNull: false,
  },
  questionText: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'question_text'
  },
  questionTextFr: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'question_text_fr'
  },
  optionA: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_a'
  },
  optionB: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_b'
  },
  optionC: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_c'
  },
  optionD: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'option_d'
  },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
    field: 'correct_answer'
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'image_url',
    get() {
      const rawValue = this.getDataValue('imageUrl');
      if (!rawValue) return null;
      // Return the path as stored in the database (should be just the filename)
      // The actual serving is handled by the static file middleware in app.js
      return `/uploads/${rawValue}`;
    }
  },
  difficulty: {
    type: DataTypes.ENUM('easy', 'medium', 'hard'),
    defaultValue: 'medium',
  },
  explanation: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  explanationFr: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'explanation_fr'
  },
});

export default Question;
