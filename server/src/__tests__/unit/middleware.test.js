import { jest } from "@jest/globals";
import { z } from "zod";
import { validateSchema } from "../../middlewares/validate.middleware.js";

describe("Validation Middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { body: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().min(18),
  });

  it("should call next() for valid data", async () => {
    req.body = { name: "John", age: 25 };
    const middleware = validateSchema(testSchema);

    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("should return 400 for invalid data", async () => {
    req.body = { name: "John", age: 10 }; // Invalid age
    const middleware = validateSchema(testSchema);

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Validation Error",
      })
    );
    expect(next).not.toHaveBeenCalled();
  });
});
