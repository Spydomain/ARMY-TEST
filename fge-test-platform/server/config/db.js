import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration with enhanced logging
console.log('🔌 Database connection details:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  ssl: process.env.PGSSLMODE === 'require' ? 'required' : 'off',
  node_env: process.env.NODE_ENV,
  dialect: 'postgres'
});

const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD || process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dialect: 'postgres',
  logging: (msg) => console.log(`[Sequelize] ${msg}`),
  
  // Connection pool settings
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '60000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
  },
  
  // Model options
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: 'utf8mb4',
    collate: 'utf8mb4_unicode_ci'
  },
  
  // PostgreSQL specific options
  dialectOptions: {
    ssl: process.env.PGSSLMODE === 'require' ? {
      require: true,
      rejectUnauthorized: false // Required for self-signed certificates
    } : false,
    keepAlive: true,
    statement_timeout: 30000,
    idle_in_transaction_session_timeout: 10000,
    connectionTimeoutMillis: 10000,
    query_timeout: 10000,
    application_name: 'fge-backend',
    options: `-c search_path=public`,
    client_encoding: 'utf8',
    timezone: 'UTC'
  },
  
  // Connection retry logic
  retry: {
    max: 5,
    timeout: 30000,
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/,
      /Connection terminated unexpectedly/,
      /Connection terminated due to connection timeout/,
      /Connection terminated unexpectedly/,
      /Connection terminated due to idle-in-transaction timeout/
    ],
    backoffBase: 1000,
    backoffExponent: 1.5,
    backoffJitter: 100,
    report: (message, obj) => {
      console.warn('🔄 Retry attempt:', message);
      if (obj && obj.sequelize && obj.sequelize.config) {
        const { host, port, database, username } = obj.sequelize.config;
        console.warn('Connection details:', { host, port, database, username });
      }
    }
  },
  
  // Other options
  benchmark: process.env.NODE_ENV === 'development',
  isolationLevel: 'READ COMMITTED',
  minifyAliases: true
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

// Test the database connection with detailed error handling
const testConnection = async () => {
  console.log('🔍 Testing database connection...');
  
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const endTime = Date.now();
    
    console.log(`✅ Database connection established successfully in ${endTime - startTime}ms`);
    
    // Get database version
    const [results] = await sequelize.query('SELECT version()');
    console.log('📊 Database version:', results[0]?.version || 'Unknown');
    
    // Get active connections
    try {
      const [connections] = await sequelize.query(
        'SELECT count(*) as active_connections FROM pg_stat_activity;'
      );
      console.log(`🔗 Active database connections: ${connections[0]?.active_connections || 'Unknown'}`);
    } catch (e) {
      console.log('ℹ️ Could not fetch active connections:', e.message);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', {
      name: error.name,
      message: error.message,
      code: error.parent?.code,
      address: error.parent?.address,
      port: error.parent?.port,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    // Provide troubleshooting tips
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Verify the database is running and accessible');
    console.log('2. Check if the hostname and port are correct');
    console.log('3. Verify the username and password');
    console.log('4. Check if the database exists');
    console.log('5. Check if the user has proper permissions');
    console.log('6. Check if the database server accepts connections');
    console.log('7. Check if a firewall is blocking the connection');
    
    // Exit with a non-zero status code to indicate failure
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
