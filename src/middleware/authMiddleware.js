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
    else if (req.cookies) {
      console.log("Available cookies:", req.cookies);
      token = req.cookies.auth_token || req.cookies.token || req.cookies.jwt;
    }
    
    if (!token) {
      console.log('No token found in request:', {
        cookies: req.cookies,
        headers: req.headers
      });
      return res.status(401).json({ message: "No authentication token found" });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      req.user._id = payload.id || payload._id;
      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", jwtError);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export default authenticateUser;
