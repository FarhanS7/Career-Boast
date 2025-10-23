// server/src/app.js
import cors from "cors";
import express from "express";
import errorHandler from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());

// All API routes
app.use("/api", routes);

// Global error handler
app.use(errorHandler);

export default app;
