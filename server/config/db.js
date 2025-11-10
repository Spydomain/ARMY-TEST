import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    freezeTableName: true
  },
  retry: {
    max: 3,
    timeout: 30000
  }
};

// Create Sequelize instance
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    ...dbConfig,
    dialectOptions: {
      connectTimeout: 60000,
      dateStrings: true,
      typeCast: true,
      decimalNumbers: true
    },
    benchmark: false,
    logQueryParameters: process.env.NODE_ENV === 'development',
  }
);

// Test the database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection has been established successfully.');
    
    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('✅ Database synchronized');
    
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    // Exit with failure code if we can't connect to the database
    process.exit(1);
  }
};

// Call the test connection function
testConnection();

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await sequelize.close();
    console.log('🛑 Database connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error closing database connection:', error);
    process.exit(1);
  }
});

export { sequelize, testConnection };
