export function errorHandler(err, req, res, next) {
  console.error('❌ Error caught by middleware:', err.stack);
  
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
}
