
import express from "express";
import cors from "cors";

import subjectsRouter from "./routes/subjects.js";
/*
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";
import departmentsRouter from "./routes/departments.js";
import statsRouter from "./routes/stats.js";
import enrollmentsRouter from "./routes/enrollments.js";
 */
import securityMiddleware from "./middleware/security.js";
import { auth } from "./lib/auth.js";
import {toNodeHandler} from "better-auth/node";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) throw new Error("FRONTEND_URL is required");

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use(
    cors({
      origin: process.env.FRONTEND_URL, // React app URL
      methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
      credentials: true, // allow cookies
    })
);

app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter);
/*app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/stats", statsRouter);
app.use("/api/enrollments", enrollmentsRouter);
*/

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`${new Date().toISOString()} - ERROR:`, err);
  res.status(err.status || 500).json({
    error: err.name || "Internal Server Error",
    message: err.message || "An unexpected error occurred",
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});