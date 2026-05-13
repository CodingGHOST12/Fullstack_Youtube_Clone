import jwt from "jsonwebtoken";

import User from "../models/User.js";

const protect = async (req, res, next) => {
  try {
    let token;

 
    // CHECK AUTH HEADER
  
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }


    // NO TOKEN
 
    if (!token) {
      return res.status(401).json({
        success: false,

        message: "Not authorized, no token",
      });
    }

  
    // VERIFY TOKEN

    const decoded = jwt.verify(
      token,

      process.env.JWT_SECRET,
    );

 
    // FIND USER

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,

        message: "User not found",
      });
    }


    // ATTACH USER
  
    req.user = user;

    next();
  } catch (error) {
    console.error(error);

    return res.status(401).json({
      success: false,

      message: "Not authorized, invalid token",
    });
  }
};

export default protect;
