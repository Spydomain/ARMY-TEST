import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const TestResult = sequelize.define('TestResult', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
  },
  category: {
    type: DataTypes.ENUM('IDENT1', 'IDENT2', 'IDENT3', 'IDENT4', 'IDENT5', 'IDENT6'),
    allowNull: false,
  },
  score: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalQuestions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100,
  },
  timeSpent: {
    type: DataTypes.INTEGER, // in seconds
    allowNull: true,
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export default TestResult;
