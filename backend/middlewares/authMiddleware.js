const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  
  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }
  
  const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader;
  
  if (!token) {
    return res.status(401).json({ message: "Token manquant" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (!decoded.userId) {
      return res.status(401).json({ message: "Token invalide: identifiant utilisateur manquant" });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Auth Middleware - Token verification failed:', err.message);
    
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: "Session expirée",
        code: "TOKEN_EXPIRED"
      });
    }
    
    res.status(403).json({ 
      message: "Token invalide",
      code: "INVALID_TOKEN",
      error: err.message
    });
  }
};
