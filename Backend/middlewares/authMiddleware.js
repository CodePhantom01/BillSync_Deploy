const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  console.log(token);

  if (!token) return res.status(403).json({ message: "Access denied" });

  try {
    console.log("Inside try");
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with env var
    console.log(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
