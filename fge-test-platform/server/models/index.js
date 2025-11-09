import { sequelize } from '../config/db.js';
import User from './User.js';
import Question from './Question.js';
import TestResult from './TestResult.js';
import UserAnswer from './UserAnswer.js';

// Define relationships
User.hasMany(TestResult, { foreignKey: 'userId' });
TestResult.belongsTo(User, { foreignKey: 'userId' });

TestResult.hasMany(UserAnswer, { foreignKey: 'testResultId' });
UserAnswer.belongsTo(TestResult, { foreignKey: 'testResultId' });

Question.hasMany(UserAnswer, { foreignKey: 'questionId' });
UserAnswer.belongsTo(Question, { foreignKey: 'questionId' });

// Call associate methods if they exist
const associateModels = () => {
  const models = { User, Question, TestResult, UserAnswer };
  
  Object.values(models).forEach(model => {
    if (model.associate) {
      model.associate(models);
    }
  });
};

// Sync all models with the database
const syncDatabase = async (force = false) => {
  const transaction = await sequelize.transaction();
  
  try {
    // Disable foreign key checks temporarily
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { transaction });
    
    // Call associate methods before syncing
    associateModels();
    
    // Sync models in the correct order to respect foreign key constraints
    // First drop all tables if force is true
    if (force) {
      await UserAnswer.drop({ transaction, cascade: true });
      await TestResult.drop({ transaction, cascade: true });
      await Question.drop({ transaction, cascade: true });
      await User.drop({ transaction, cascade: true });
    }
    
    // Then create tables in the correct order
    await User.sync({ transaction, force: false });
    await Question.sync({ transaction, force: false });
    await TestResult.sync({ transaction, force: false });
    await UserAnswer.sync({ transaction, force: false });
    
    // Re-enable foreign key checks
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1', { transaction });
    
    await transaction.commit();
    console.log('Database synced successfully');
  } catch (error) {
    await transaction.rollback();
    console.error('Error syncing database:', error);
    throw error;
  }
};

export {
  User,
  Question,
  TestResult,
  UserAnswer,
  syncDatabase,
  sequelize
};

export default {
  User,
  Question,
  TestResult,
  UserAnswer,
  syncDatabase,
  sequelize
};
