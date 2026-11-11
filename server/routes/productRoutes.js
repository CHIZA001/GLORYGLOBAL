const express = require("express");

const {
    createProduct,
    getAllProducts,
    getProductByCode,
    updateProduct,
    deleteProduct
} = require("../controller/productController");

const router = express.Router();

// Create a new product
router.post("/", createProduct);

// Get all products
router.get("/", getAllProducts);

// Get one product by product code
router.get("/:productCode", getProductByCode);

// Update product
router.put("/:productCode", updateProduct);

// Delete product
router.delete("/:productCode", deleteProduct);

module.exports = router;
