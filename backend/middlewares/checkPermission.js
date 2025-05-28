const User = require("../models/User");
const Role = require("../models/Role");

module.exports = (permission) => async (req, res, next) => {

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ 
      message: "Non authentifié",
      code: "UNAUTHENTICATED"
    });
  }

  try {
    const user = await User.findById(req.user.userId).populate("roles");
    
    if (!user) {
      return res.status(404).json({ 
        message: "Utilisateur non trouvé",
        code: "USER_NOT_FOUND"
      });
    }

    
    const hasPermission = user.roles.some(role => {
      const hasPerm = role.permissions.includes(permission) || role.name === "admin";
      return hasPerm;
    });

    if (!hasPermission) {
      return res.status(403).json({ 
        message: "Permission refusée",
        code: "PERMISSION_DENIED",
        requiredPermission: permission,
        userRoles: user.roles.map(r => r.name)
      });
    }

    next();
  } catch (err) {
    console.error('Permission Middleware - Error:', err);
    res.status(500).json({ 
      message: "Erreur serveur",
      code: "SERVER_ERROR",
      error: err.message 
    });
  }
};
