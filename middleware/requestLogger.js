/**
 * Request Logging Middleware
 * Logs incoming requests for debugging and monitoring purposes
 */

function requestLogger(req, res, next) {
  const start = Date.now();
  
  // Log the incoming request
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.path} - IP: ${req.ip}`);
  
  // Log request details for debugging
  if (process.env.NODE_ENV === 'development') {
    console.log(`   Headers:`, req.headers);
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`   Body:`, req.body);
    }
  }
  
  // Override res.end to log response details
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    
    // Log the response
    console.log(`📤 ${new Date().toISOString()} - ${req.method} ${req.path} - ${statusCode} (${duration}ms)`);
    
    // Call the original end method
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

module.exports = { requestLogger };
