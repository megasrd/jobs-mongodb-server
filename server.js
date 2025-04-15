const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb'); // Keep your MongoDB imports
const app = express();
require('dotenv').config(); // For environment variables

console.log(process.env.DB_PASSWORD); // Debugging line to check if the password is loaded

const PORT = process.env.PORT || 4000;

// --- MongoDB Configuration ---
// !! SECURITY WARNING: Avoid hardcoding credentials like this in production.
//    Use environment variables (process.env.MONGODB_URI) instead.
const uri = `mongodb+srv://reganjduthie:${process.env.DB_PASSWORD}@brjoblistingsample.issgebo.mongodb.net/?retryWrites=true&w=majority&appName=BRJobListingSample`;

// Database and Collection names - !! REPLACE THESE WITH YOUR ACTUAL NAMES !!
const DATABASE_NAME = "TESTING_JOBS"; // Example: Or whatever your DB is called
const COLLECTION_NAME = "TESTING_JOBS_LIST"; // Example: Or 'listings', 'joboffers', etc.

// Create a MongoClient instance
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db; // Variable to hold the database connection reference
let jobsCollection; // Variable to hold the collection reference

// --- Function to Connect to MongoDB ---
async function connectToMongo() {
  try {
    await client.connect(); // Connect the client to the server
    console.log("Successfully connected to MongoDB!");
    db = client.db(DATABASE_NAME); // Get the database reference
    jobsCollection = db.collection(COLLECTION_NAME); // Get the collection reference

    // Optional: You can add a ping here if you want to be extra sure
    await db.command({ ping: 1 });
    console.log(`Connected to database '${DATABASE_NAME}' and collection '${COLLECTION_NAME}'`);

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    // Exit the process if we can't connect to the DB on startup
    process.exit(1);
  }
  // *** REMOVED client.close() from here - keep connection open ***
}

// --- API Routes ---

// Root route (optional)
app.get("/", (req, res) => {
  res.send("Hello World! This is the server for the job listing app. Try /jobs");
});

// Route to get job listings
app.get("/jobs", async (req, res) => {
  // Check if the database connection and collection reference are available
  if (!jobsCollection) {
    console.error("Job collection not initialized. DB connection might have failed.");
    return res.status(500).json({ message: "Server error: Database not available" });
  }

  try {
    // Find all documents in the collection.
    // find({}) returns a cursor, so use .toArray() to get all documents as an array.
    const jobs = await jobsCollection.find({}).toArray();

    // Send the fetched jobs array back to the client as JSON
    res.json(jobs);

  } catch (err) {
    console.error("Error fetching jobs from MongoDB:", err);
    res.status(500).json({ message: "Failed to retrieve job listings" });
  }
});


// --- Start the Server ---
async function startServer() {
  await connectToMongo(); // Connect to the database FIRST

  // THEN start listening for HTTP requests
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// --- Run the server ---
startServer();

// --- Graceful Shutdown (Optional but Recommended) ---
// This helps ensure the MongoDB client closes when the server stops
process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing MongoDB connection...');
  await client.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing MongoDB connection...');
  await client.close();
  console.log('MongoDB connection closed.');
  process.exit(0);
});