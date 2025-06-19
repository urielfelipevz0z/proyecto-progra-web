const errorHandler = (error, req, res, next) => {
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';

  // Sequelize validation errors
  if (error.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = error.errors.map(err => err.message).join(', ');
  }

  // Sequelize unique constraint errors
  if (error.name === 'SequelizeUniqueConstraintError') {
    statusCode = 400;
    message = 'Resource already exists';
    
    if (error.fields && error.fields.email) {
      message = 'Email already exists';
    } else if (error.fields && error.fields.username) {
      message = 'Username already exists';
    }
  }

  // Sequelize foreign key constraint errors
  if (error.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Invalid reference to related resource';
  }

  // Sequelize database connection errors
  if (error.name === 'SequelizeConnectionError') {
    statusCode = 503;
    message = 'Database connection error';
  }

  // JWT errors (should be handled in auth middleware, but just in case)
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Custom application errors
  if (error.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.errors || error.details 
    })
  });
};

module.exports = errorHandler;
