const jwt = require('jsonwebtoken');

// 1. The Guard that checks if you have a valid token at all
const verifyToken = (req, res, next) => {
  let token;
  
  // Tokens are usually sent in the "Authorization" header like this: "Bearer eyJhbGci..."
  let authHeader = req.headers.Authorization || req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer')) {
    token = authHeader.split(' ')[1]; // Extracts just the token part
    
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'User is not authorized (Invalid Token)' });
      }
      
      // We attach the decoded token data (userId and role) to the request!
      req.user = decoded; 
      next(); // Let them pass to the next step
    });
  } else {
    return res.status(401).json({ message: 'No token provided, authorization denied' });
  }
};

// 2. The Guard that checks if you have the RIGHT role
// We pass in an array of allowed roles, like ['Admin', 'Analyst']
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    // Check if the user's role (from the token) is inside the allowedRoles array
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Requires one of these roles: ${allowedRoles.join(', ')}` 
      });
    }
    next(); // Let them pass!
  };
};

module.exports = { verifyToken, requireRole };