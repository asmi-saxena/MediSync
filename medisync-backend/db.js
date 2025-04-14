require("dotenv").config(); // Load environment variables
const mongoose = require("mongoose"); // Import Mongoose

const connectDB = async () => {
    try {
        console.log("Attempting to connect to MongoDB...");
        
        // Force Mongoose to use the native MongoDB driver's ObjectId
        mongoose.ObjectId.get(() => mongoose.Types.ObjectId);
        
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            dbName: 'medisync'
        });
        
        console.log("✅ MongoDB Connected Successfully");
        console.log("Connected to database:", conn.connection.db.databaseName);
        
        // List all collections
        const collections = await conn.connection.db.listCollections().toArray();
        console.log("Available collections:", collections.map(c => c.name));
        
        // Verify connection by running a test query
        const testQuery = await conn.connection.db.collection('equipments').find({}).toArray();
        console.log("Test query result count:", testQuery.length);
        if (testQuery.length > 0) {
            console.log("First document:", JSON.stringify(testQuery[0], null, 2));
        }
        
    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        console.error("Error details:", err.message);
        process.exit(1); // Exit the process with failure
    }
};

module.exports = connectDB;
