
export function validateSchema(schema) {
  return async (req, res, next) => {
    const result = await schema.safeParseAsync(req.body);
    
    if (!result.success) {
      const errors = result.error.errors || result.error.issues || [];
      return res.status(400).json({
        error: "Validation Error",
        details: errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
    }

    req.body = result.data;
    next();
  };
}
