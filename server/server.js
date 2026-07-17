require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(express.json())
app.use(cors());
//Home Route
app.get('/',(req, res) => {
    res.send('Welcome to Glory Global Merchandise Inventory Management System');});
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ connected to Mongo Atlas');
        
    })
 .catch((err) => {
    console.error('❌ Database connection failed:', err);
});

//start server
app.listen(PORT,() => {
    console.log(`Server is running on http://localhost:${PORT}`);});
       

    