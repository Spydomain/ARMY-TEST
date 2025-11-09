import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration
const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS, // Handle both DB_PASSWORD and DB_PASS
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432, // Default PostgreSQL port
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10, // Increased from 5 to 10 for Render
    min: 0,
    acquire: 60000,
    idle: 10000
  },
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  },
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    keepAlive: true,
    statement_timeout: 60000,
    idle_in_transaction_session_timeout: 60000,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    application_name: 'fge-backend'
  },
  retry: {
    max: 5,
    timeout: 30000,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    backoffBase: 1000, // Start with 1 second delay
    backoffExponent: 1.5,
    report: (message, obj) => console.warn('Retry attempt:', message, obj)
  },
  benchmark: process.env.NODE_ENV === 'development'
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
