const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./db");

dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Import Routes
const hospitalRoutes = require("./routes/hospitalRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Use Routes
app.use("/api/hospitals", hospitalRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
    res.send("MediSync Backend Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
