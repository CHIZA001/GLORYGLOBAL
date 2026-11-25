require("dotenv").config();

const mongoose = require("mongoose");
const cors = require("cors");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

// Import Routes
const staffRoutes = require("./routes/staffRoutes");
const productRoutes = require("./routes/productRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const salesRoutes = require("./routes/salesRoutes");

// Middleware
app.use(express.json());
app.use(cors());

// Staff Routes
app.use("/api/staff", staffRoutes);

// Product Routes
app.use("/api/products", productRoutes);
app.use("/api/inventory", inventoryRoutes);

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to Glory Global Merchandise Inventory Management System");
});
// Sales Routes
app.use("/api/sales", salesRoutes);

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB Atlas");

        // Start Server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });