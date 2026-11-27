const express = require("express");
const router = express.Router();

const {
    createSale,
    getAllSales,
    getSaleBySaleNumber
} = require("../controller/salesController");

// CREATE SALE
router.post("/", createSale);

// GET ALL SALES
router.get("/", getAllSales);

// GET INDIVIDUAL SALE
router.get("/:saleNumber", getSaleBySaleNumber);

module.exports = router;