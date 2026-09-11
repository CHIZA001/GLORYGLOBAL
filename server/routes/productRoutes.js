const express = require("express");
const { createProduct,
     getAllProducts,
     getProductByCode,
     updateProduct
    } = require("../controller/productController");
const router = express.Router();
//Create a new Product
router.post("/", createProduct);
//Get all Products
router.get("/", getAllProducts);
module.exports = router;
//Get one product by product code
router.get("/:productCode", getProductByCode)
// Update product
router.put("/:productCode", updateProduct);
//Delete a product
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findByIdAndDelete(id);
        if(!product) {
            return res.status(404).json({
                message:"Product not found"
            });
        }
        res.status(200).json({
            messsage:"Product deleted successfully",
            product
        });
    } catch (error) {
        res.status(500).json({
            message:"Error deleting product",
            error: error.message
        });
    }

};