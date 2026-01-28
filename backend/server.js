import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import submissionRoutes from "./routes/submissions.js";

// Route files
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import processorRoutes from "./routes/processor.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Route middleware (base API paths)
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/processor", processorRoutes);
app.use("/api/submissions", submissionRoutes);

// Root endpoint (for testing API)
app.get("/", (req, res) => res.send("ERR Expenses Web App API Running"));

// Health check endpoint
app.get("/health", (req, res) => res.json({ ok: true }));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
