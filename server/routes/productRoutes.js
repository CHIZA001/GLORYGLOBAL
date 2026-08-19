const express = require(" express");
const { createProduct } = require("../controller/productController");
const router = expres.Router();

//Create a new Product
router.post("/", createProduct);
module.exports = router;