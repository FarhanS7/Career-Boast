
/**
 * Optional authentication middleware
 * Attaches user info to req.auth if token is present
 * Does not block requests without auth
 */
export const optionalAuth = async (req, res, next) => {
  try {
    // If Clerk has already attached auth info, pass it through
    if (req.auth?.userId) {
      return next();
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    next();
  }
};

/**
 * Required authentication middleware
 * Blocks requests without valid authentication
 */
export const requireAuth = async (req, res, next) => {
  try {
    if (!req.auth?.userId) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      error: "Unauthorized",
      message: "Authentication failed",
    });
  }
};

export default { optionalAuth, requireAuth };
