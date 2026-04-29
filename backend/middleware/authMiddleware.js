const jwt = require("jsonwebtoken");
const { User } = require("../models");

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const decoded = jwt.verify(token, secret);
    const currentUser = await User.findByPk(decoded.id);

    if (!currentUser || Number(currentUser.session_version || 0) !== Number(decoded.session_version || 0)) {
      return res.status(401).json({ message: "Session expired" });
    }

    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = {
  authenticateToken,
  authorizeRoles,
};
