require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { sequelize } = require('./models');
const Logger = require('./utils/logger');

class App {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    
    this.initializeMiddleware();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  initializeMiddleware() {
    // Security middleware
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" }
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use('/api', limiter);

    // CORS configuration
    this.app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:8080',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));

    // Logging
    if (process.env.NODE_ENV === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use((req, res, next) => {
      Logger.debug(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        body: req.method !== 'GET' ? req.body : undefined
      });
      next();
    });
  }

  initializeRoutes() {
    // API routes
    this.app.use('/api', routes);

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'Pump Monitoring API',
        version: '1.0.0',
        documentation: '/api/health'
      });
    });

    // 404 handler for non-API routes
    this.app.use('*', (req, res) => {
      res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
      });
    });
  }

  initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  async connectDatabase() {
    try {
      await sequelize.authenticate();
      Logger.success('Database connection established successfully');
      
      if (process.env.NODE_ENV === 'development') {
        Logger.info('Running in development mode - checking database sync');
        // Only sync in development, use migrations in production
        // await sequelize.sync({ alter: true });
        // Logger.info('Database models synchronized');
      }
    } catch (error) {
      Logger.error('Unable to connect to the database:', error.message);
      process.exit(1);
    }
  }

  async start() {
    try {
      await this.connectDatabase();
      
      this.server = this.app.listen(this.port, () => {
        Logger.success(`Server is running on port ${this.port}`);
        Logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        Logger.info(`API Health Check: http://localhost:${this.port}/api/health`);
        
        if (process.env.NODE_ENV === 'development') {
          Logger.info('Development endpoints:');
          Logger.info(`  Frontend CORS: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
          Logger.info(`  Database: ${process.env.DB_NAME || 'pump_monitoring'}`);
        }
      });

      // Graceful shutdown
      process.on('SIGTERM', () => this.shutdown());
      process.on('SIGINT', () => this.shutdown());
      
    } catch (error) {
      Logger.error('Failed to start server:', error.message);
      process.exit(1);
    }
  }

  async shutdown() {
    Logger.info('Shutting down server...');
    
    if (this.server) {
      this.server.close(() => {
        Logger.info('HTTP server closed');
      });
    }

    try {
      await sequelize.close();
      Logger.info('Database connection closed');
    } catch (error) {
      Logger.error('Error closing database connection:', error.message);
    }

    process.exit(0);
  }
}

// Start the application
if (require.main === module) {
  const app = new App();
  app.start();
}

module.exports = App;
