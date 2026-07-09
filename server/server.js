const express = require('express')
const app = express();
const PORT = 5000;
// Middleware
app.use(express.json())
//Home Route
app.get('/',(req, res) => {
    res.send('Welcome to Glory Global Merchandise Inventory Management System');});
//start server
app.listen(PORT,() => {
    console.log(`Server is running on http://localhost:${PORT}`);});
       

    