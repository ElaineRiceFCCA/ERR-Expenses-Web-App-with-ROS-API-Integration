import mongoose from "mongoose";

// Establishes a connection to MongoDB using the MONGO_URI
// defined in environment variables.
const connectDB = async () => {
  try {
    // Initiates Mongoose connection (returns connection object)
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Logs the connected host for verification/debugging
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // Logs connection failure and exits process to prevent
    // the application running without a database connection
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

export default connectDB;
