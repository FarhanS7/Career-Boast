import { clerkMiddleware, getAuth } from "@clerk/express";

/**
 * Use this to apply Clerk middleware globally:
 * app.use(clerkMiddleware());
 *
 * Then to protect routes, use requireAuth-like logic:
 */
export function attachClerkMiddleware(app) {
  app.use(clerkMiddleware());
}

// Use in controllers / routes to assert and set req.userId
export function requireAuth(req, res, next) {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    req.userId = userId;
    req.userId = req.auth.userId;
    next();
  } catch (err) {
    next(err);
  }
}
