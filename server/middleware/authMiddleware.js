const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: invalid token" });
  }
};

const authorizeRoles = (...roles) => (req, res, next) => {
  const userRole = req.user?.role ? String(req.user.role).toLowerCase() : "";
  const allowedRoles = roles.map((role) => String(role).toLowerCase());
  if (!req.user || !allowedRoles.includes(userRole)) {
    return res.status(403).json({ message: "Forbidden: insufficient role" });
  }
  return next();
};

module.exports = { verifyToken, authorizeRoles };
