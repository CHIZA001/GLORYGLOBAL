const express = require("express");
const { createProduct,
        getAllproducts
} = require("../controller/productController");
const router = express.Router();
//Create a new Product
router.post("/", createProduct);
//Get all Products
router.get("/", getAllProducts);
module.exports = router;