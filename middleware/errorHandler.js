const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err.stack);

  // Default error message and status code
  const statusCode = 200;
  let errorMessage = err.message || 'Internal Server Error';
  
  // Customize error messages based on error type
  // if (err.name === 'ValidationError') {
  //     errorMessage = 'Validation failed. Please check your input data.';
  // } else if (err.name === 'CastError') {
  //     errorMessage = 'Invalid data format provided.';
  // } else if (err.code === 11000) {
  //     errorMessage = 'Duplicate entry found. This record already exists.';
  // } else if (err.name === 'MongoNetworkError') {
  //     errorMessage = 'Database connection error. Please try again later.';
  // } else if (statusCode === 500) {
  //     errorMessage = 'Something went wrong on our end. Please try again later.';
  // }

  // Return consistent format matching your other API responses
  res.status(statusCode).json({
      response_type: "in_channel",
      blocks: [
          {
              type: "section",
              text: {
                  type: "mrkdwn",
                  text: `${errorMessage}`,
              },
          },
      ],
      // Include stack trace only in development
      ...(process.env.NODE_ENV === 'development' && { 
          debug: {
              stack: err.stack,
              originalMessage: err.message
          }
      })
  });
};

module.exports = errorHandler;