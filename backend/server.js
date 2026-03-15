import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Route Files
import submissionRoutes from "./routes/submissions.js";
import employeeRoutes from "./routes/employees.js";
import elementRoutes from "./routes/elements.js";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import processorRoutes from "./routes/processor.js";
import revenueRoutes from "./routes/revenue.js";
import companyRoutes from "./routes/company.js";
import reportRoutes from "./routes/reports.js";
import adminReportRoutes from "./routes/adminReports.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Route middleware (base API paths)
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/processor", processorRoutes);
app.use("/api/processor/submissions", submissionRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/elements", elementRoutes);
app.use("/api/revenue", revenueRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/admin/reports", adminReportRoutes);

// Root endpoint (for testing API)
app.get("/", (req, res) => {
  res.send("ERR Expenses Web App API Running");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ ok: true });
});

// Start server
const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
