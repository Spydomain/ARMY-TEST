import app from './app.js';
import { sequelize, testConnection } from './config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Keep track of server instance
let server;

// Handle shutdown gracefully
const shutdown = async (signal) => {
  console.log(`\n🛑 [${new Date().toISOString()}] Received ${signal}. Shutting down gracefully...`);
  
  // Close HTTP server if it exists
  if (server) {
    console.log('🔄 Closing HTTP server...');
    server.close((err) => {
      if (err) {
        console.error('Error closing HTTP server:', err);
        process.exit(1);
      }
      console.log('✅ HTTP server closed');
    });
  }
  
  // Close database connection
  try {
    if (sequelize) {
      console.log('🔄 Closing database connections...');
      await sequelize.close();
      console.log('✅ Database connections closed');
    }
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
  
  // Force exit after timeout
  setTimeout(() => {
    console.error('Could not close connections in time, forcing shutdown');
    process.exit(1);
  }, 10000);
};

// Handle uncaught exceptions and unhandled rejections
process.on('uncaughtException', (error) => {
  console.error('\n⚠️  Uncaught Exception:', error);
  // Don't exit immediately, let the server continue running
  // but log the error for debugging
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('\n⚠️  Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit immediately, let the server continue running
  // but log the error for debugging
});

// Handle different termination signals
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Handle uncaught exceptions that bubble up to the event loop
process.on('uncaughtExceptionMonitor', (error, origin) => {
  console.error('\n⚠️  Uncaught Exception Monitor:', error, 'Origin:', origin);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  shutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  shutdown('unhandledRejection');
});

// Test database connection and start the server
const startServer = async () => {
  console.log(`\n🚀 Starting ${NODE_ENV} server...`);
  
  try {
    // Test database connection
    await testConnection();
    
    // Start the server
    server = app.listen(PORT, () => {
      console.log(`\n✅ Server is running on port ${PORT}`);
      console.log(`🔗 http://localhost:${PORT}`);
      console.log(`📅 ${new Date().toISOString()}`);
      console.log('\nPress Ctrl+C to stop the server\n');
    });
    
    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }
      
      // Handle specific listen errors with friendly messages
      switch (error.code) {
        case 'EACCES':
          console.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(`Port ${PORT} is already in use`);
          process.exit(1);
          break;
        default:
          throw error;
      }
    });
    
    return server;
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    await shutdown('STARTUP_ERROR');
    throw error;
  }
  try {
    console.log('Attempting to connect to the database...');
    
    // Authenticate database connection
    try {
      await sequelize.authenticate();
      console.log('✅ Database connection has been established successfully.');
    } catch (dbError) {
      console.error('❌ Unable to connect to the database:', dbError);
      throw dbError;
    }
    
    try {
      console.log('Syncing database models...');
      // Sync all models with force: true to drop and recreate tables
      await syncDatabase(true);
      console.log('✅ Database models synced successfully');
    } catch (syncError) {
      console.error('❌ Error syncing database models:', syncError);
      throw syncError;
    }
    
    try {
      console.log('Importing questions...');
      // Import questions from images if needed
      const { default: importQuestions } = await import('./scripts/importQuestions.js');
      await importQuestions();
      console.log('✅ Questions imported successfully');
    } catch (importError) {
      console.error('⚠️ Warning: Error importing questions:', importError);
      // Continue even if question import fails
    }
    
    // Start the server
    server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('Press Ctrl+C to stop the server\n');
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else {
        console.error('Server error:', error);
      }
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });
    
    // Handle SIGTERM for graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully');
      server.close(() => {
        console.log('Process terminated');
      });
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(error => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});
