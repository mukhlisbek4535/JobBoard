import mongoose from "mongoose";

// Function to connect to the MongoDB database
const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1); // Exit the process with failure
  }
};

export default connectDB;
