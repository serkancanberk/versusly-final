import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    
    // Check for token in Authorization header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
    }
    
    if (!token) {
      return res.status(401).json({ message: "No authentication token found" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authenticateUser;
