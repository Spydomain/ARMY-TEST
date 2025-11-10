import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database connection configuration with enhanced logging
console.log('🔌 Database connection details:', {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  ssl: process.env.DB_SSL === 'REQUIRED',
  node_env: process.env.NODE_ENV,
  dialect: process.env.DB_DIALECT || 'mysql',
  // Don't log the actual password
  password: process.env.DB_PASS ? '***' : 'not set'
});

// Log environment for debugging
console.log('🌍 Environment:', {
  NODE_ENV: process.env.NODE_ENV,
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',
  DB_SSL: process.env.DB_SSL,
  RENDER: process.env.RENDER ? 'true' : 'false',
  DB_HOST: process.env.DB_HOST ? 'set' : 'not set',
  DB_USER: process.env.DB_USER ? 'set' : 'not set',
  DB_PASS: process.env.DB_PASS ? 'set' : 'not set',
  DB_NAME: process.env.DB_NAME ? 'set' : 'not set'
});

// Database configuration with enhanced SSL settings
const dbConfig = {
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '11461', 10), // Using port from Aiven
  dialect: 'mysql',
  timezone: process.env.TZ || '+00:00',
  logging: (msg) => console.log(`[Sequelize] ${msg}`),
  define: {
    timestamps: true,
    underscored: true
  },
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: true,
      ca: process.env.DB_CA_CERT?.replace(/\\n/g, '\n') // Ensure newlines are properly formatted
    },
    connectTimeout: 60000
  },
  
  // Connection pool settings
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '60000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10)
  },
  
  // SSL and connection settings for Aiven MySQL
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Required for Aiven's self-signed certs
      // Additional SSL options for Aiven
      minVersion: 'TLSv1.2'
    },
    // Connection settings
    connectTimeout: 60000, // 60 seconds
    decimalNumbers: true,
    supportBigNumbers: true,
    bigNumberStrings: true,
    dateStrings: true,
    typeCast: true,
    // Enable keep-alive
    keepAlive: true,
    // Timezone settings
    timezone: process.env.TZ || '+00:00',
    // Debug settings
    debug: process.env.NODE_ENV === 'development',
    // Multiple statements (disabled for security)
    multipleStatements: false
  },
  
  // Connection pool settings
  pool: {
    max: parseInt(process.env.DB_POOL_MAX || '10', 10),
    min: parseInt(process.env.DB_POOL_MIN || '0', 10),
    acquire: parseInt(process.env.DB_POOL_ACQUIRE || '60000', 10),
    idle: parseInt(process.env.DB_POOL_IDLE || '10000', 10),
    evict: 10000, // The maximum time, in milliseconds, that a connection can be idle before being released
    handleDisconnects: true
  },
  
  // Model options
  define: {
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    charset: process.env.DB_CHARSET || 'utf8mb4',
    collate: process.env.DB_COLLATE || 'utf8mb4_unicode_ci',
    engine: 'InnoDB'
  },
  
  // MySQL specific options
  dialectOptions: {
    ssl: process.env.DB_SSL === 'REQUIRED' ? {
      require: true,
      rejectUnauthorized: false
    } : false,
    connectTimeout: 60000, // 60 seconds
    decimalNumbers: true,
    supportBigNumbers: process.env.DB_SUPPORT_BIG_NUMBERS === 'true',
    bigNumberStrings: process.env.DB_BIG_NUMBER_STRINGS === 'true',
    dateStrings: true,
    typeCast: true,
    timezone: process.env.DB_TIMEZONE || '+00:00',
    // For MySQL 8+ with caching_sha2_password
    authPlugins: {
      mysql_clear_password: () => () => {
        return Buffer.from((process.env.DB_PASSWORD || '') + '\0');
      }
    }
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
    
    // Test connection
    await sequelize.authenticate();
    
    const endTime = Date.now();
    console.log(`✅ Database connection established successfully in ${endTime - startTime}ms`);
    
    // Get database information
    try {
      // Get database version
      const versionQuery = {
        mysql: 'SELECT VERSION() as version',
        postgres: 'SELECT version() as version',
        sqlite: 'SELECT sqlite_version() as version'
      }[sequelize.getDialect()] || 'SELECT 1 as version';
      
      const [versionResults] = await sequelize.query(versionQuery);
      console.log(`📊 ${sequelize.getDialect().toUpperCase()} Version:`, versionResults[0]?.version || 'Unknown');
      
      // Get current database info
      const dbQuery = {
        mysql: 'SELECT DATABASE() as name, USER() as user, @@hostname as host',
        postgres: 'SELECT current_database() as name, current_user as user, inet_server_addr() as host',
        sqlite: 'SELECT 1 as name, 1 as user, 1 as host'
      }[sequelize.getDialect()] || 'SELECT 1 as name, 1 as user, 1 as host';
      
      const [dbInfo] = await sequelize.query(dbQuery);
      console.log('💾 Database Info:', {
        Name: dbInfo[0]?.name || 'Unknown',
        User: dbInfo[0]?.user || 'Unknown',
        Host: dbInfo[0]?.host || 'Unknown'
      });
      
      // Get connection stats if available
      if (sequelize.getDialect() === 'mysql') {
        try {
          const [status] = await sequelize.query('SHOW STATUS LIKE \'Threads_connected\'');
          console.log(`🔗 Threads connected: ${status[0]?.Value || 'Unknown'}`);
        } catch (error) {
          console.warn('⚠️ Could not fetch thread status:', error.message);
        }
      }
      
    } catch (e) {
      console.log('ℹ️ Could not fetch database details:', e.message);
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
