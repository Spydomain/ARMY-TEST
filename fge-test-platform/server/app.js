import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { syncDatabase } from './models/index.js';
import authRoutes from './routes/auth.js';
import questionRoutes from './routes/questions.js';
import testRoutes from './routes/tests.js';
import userRoutes from './routes/users.js';
import { notFound, errorHandler } from './middleware/error.js';
import passport from './config/passport.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif)'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

const app = express();

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://army-test.onrender.com',
  'https://fgetestplatform.netlify.app',
  'https://fgetestplatform.netlify.app',
  'https://*.netlify.app'
];

// Enable CORS for all routes
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// Standard middleware
app.use(express.json());
app.use(passport.initialize());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test database connection and check tables
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    await sequelize.authenticate();
    
    // Get all tables in the database
    const [tables] = await sequelize.query(
      "SHOW TABLES"
    );
    
    // Get table structures
    const tableInfo = {};
    
    for (const table of tables) {
      const tableName = Object.values(table)[0];
      try {
        // Get table structure
        const [columns] = await sequelize.query(
          `DESCRIBE ${tableName}`
        );
        
        // Get row count
        const [countResult] = await sequelize.query(
          `SELECT COUNT(*) as count FROM ${tableName}`
        );
        
        tableInfo[tableName] = {
          columns: columns.map(col => ({
            field: col.Field,
            type: col.Type,
            null: col.Null,
            key: col.Key,
            default: col.Default,
            extra: col.Extra
          })),
          rowCount: countResult[0].count
        };
      } catch (err) {
        console.error(`Error getting info for table ${tableName}:`, err);
        tableInfo[tableName] = { error: err.message };
      }
    }
    
    res.json({
      status: 'ok',
      database: {
        connected: true,
        databaseName: sequelize.config.database,
        tables: tableInfo
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);

// File upload route
app.post('/api/upload', passport.authenticate('jwt', { session: false }), upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'FGE API running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;
