import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const UserAnswer = sequelize.define('UserAnswer', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  testResultId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'TestResults',
      key: 'id',
    },
  },
  questionId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Questions',
      key: 'id',
    },
  },
  selectedOption: {
    type: DataTypes.ENUM('A', 'B', 'C', 'D'),
    allowNull: false,
  },
  isCorrect: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  timeSpent: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true,
  },
});

export default UserAnswer;
