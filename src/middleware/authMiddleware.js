import jwt from "jsonwebtoken";

const authenticateUser = (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;
    
    // Enhanced logging for debugging
    console.log('Auth request details:', {
      path: req.path,
      method: req.method,
      cookies: req.cookies,
      headers: {
        authorization: authHeader,
        cookie: req.headers.cookie,
        origin: req.headers.origin,
        referer: req.headers.referer
      }
    });
    
    // Check for token in Authorization header
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
      console.log('Token found in Authorization header');
    } 
    // Check for token in cookies
    else if (req.cookies && req.cookies.auth_token) {
      token = req.cookies.auth_token;
      console.log('Token found in cookies');
    } else {
      console.log('No token found in request:', {
        cookies: req.cookies,
        headers: req.headers
      });
      return res.status(401).json({ message: "No authentication token found" });
    }
    
    if (!token) {
      console.log('No token found in request:', {
        cookies: req.cookies,
        headers: req.headers
      });
      return res.status(401).json({ message: "No authentication token found" });
    }

    try {
      // Log JWT secret length for debugging (not the actual secret)
      console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length);
      
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
      req.user._id = payload.id || payload._id;
      console.log('Token verified successfully for user:', req.user._id);
      next();
    } catch (jwtError) {
      console.error("JWT verification failed:", {
        name: jwtError.name,
        message: jwtError.message,
        expiredAt: jwtError.expiredAt
      });
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Authentication failed" });
  }
};

export default authenticateUser;
