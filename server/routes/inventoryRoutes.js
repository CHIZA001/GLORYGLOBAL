const express = require("express");
const router = express.Router();

const {
    stockIn,
    stockOut,
    adjustStock,
    getInventoryHistory,
    getLowStockProducts
} = require("../controller/inventoryController");

router.post("/in", stockIn);
router.post("/out", stockOut);
router.post("/adjust", adjustStock);
router.get("/history", getInventoryHistory);
router.get("/low-stock", getLowStockProducts);

module.exports = router;