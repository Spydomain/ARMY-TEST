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
  },
  questionTextFr: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  optionA: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  optionB: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  optionC: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  optionD: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  correctAnswer: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: true,
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
  },
});

export default Question;
