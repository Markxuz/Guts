const jwt = require("jsonwebtoken");
const { sequelize, User } = require("../../../models");

let hasSessionVersionColumnCache;

async function hasSessionVersionColumn() {
  if (typeof hasSessionVersionColumnCache === "boolean") {
    return hasSessionVersionColumnCache;
  }

  try {
    const definition = await sequelize.getQueryInterface().describeTable("Users");
    hasSessionVersionColumnCache = Object.prototype.hasOwnProperty.call(definition, "session_version");
  } catch {
    hasSessionVersionColumnCache = false;
  }

  return hasSessionVersionColumnCache;
}

async function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET || "dev-secret-change-me";
    const decoded = jwt.verify(token, secret);

    if (await hasSessionVersionColumn()) {
      const currentUser = await User.findByPk(decoded.id, { attributes: ["id", "session_version"] });
      if (!currentUser || Number(currentUser.session_version || 0) !== Number(decoded.session_version || 0)) {
        return res.status(401).json({ message: "Session expired" });
      }
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
