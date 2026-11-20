const express = require("express");
const router = express.Router();

const {
    createSale
} = require("../controller/salesController");

// CREATE SALE
router.post("/", createSale);

module.exports = router;