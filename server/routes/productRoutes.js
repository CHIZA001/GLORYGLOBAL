const express = require("express");
const {
     createProduct,
     getAllProducts,
     getProductByCode,
     updateProduct,
     deleteProduct
    } = require("../controller/productController");
const router = express.Router();
//Create a new Product
router.post("/", createProduct);
//Get all Products
router.get("/", getAllProducts);
//Get one product by product code
router.get("/:productCode", getProductByCode)
// Update product
router.put("/:productCode", updateProduct);
//Delete a product
router.delete("/:id", deleteProduct);
module.exports = router;

// const deleteProduct = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const product = await Product.findByIdAndDelete(id);
//         if(!product) {
//             return res.status(404).json({
//                 message:"Product not found"
//             });
//         }
//         res.status(200).json({
//             message:"Product deleted successfully",
//             product
//         });
//     } catch (error) {
//         res.status(500).json({
//             message:"Error deleting product",
//             error: error.message
//         });
//     }

// };
// NEW CODED ONES 
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

// Delete a product
router.delete("/:productCode", deleteProduct);

module.exports = router;