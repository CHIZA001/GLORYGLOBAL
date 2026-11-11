const mongoose = require("mongoose");
const Product = require("../models/Product");
const InventoryTransaction = require("../models/inventoryTransaction.js");

// STOCK IN
const stockIn = async (req, res) => {
    const { productId, quantity, reason, performedBy } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive whole number" });
    }

    if (!reason || !performedBy) {
        return res.status(400).json({ message: "Reason and staff name are required" });
    }

    const session = await mongoose.startSession();

    try {
        let updatedProduct;

        await session.withTransaction(async () => {
            const product = await Product.findById(productId).session(session);

            if (!product) {
                throw new Error("Product not found");
            }

            const previousQuantity = product.quantity;
            const newQuantity = previousQuantity + quantity;

            updatedProduct = await Product.findOneAndUpdate(
                { _id: productId },
                { $inc: { quantity } },
                { new: true, session, runValidators: true }
            );

            await InventoryTransaction.create([{
                product: productId,
                transactionType: "IN",
                quantity,
                previousQuantity,
                newQuantity,
                reason,
                performedBy
            }], { session });
        });

        res.status(200).json({
            message: "Stock added successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};


// STOCK OUT
const stockOut = async (req, res) => {
    const { productId, quantity, reason, performedBy } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be a positive whole number" });
    }

    if (!reason || !performedBy) {
        return res.status(400).json({ message: "Reason and staff name are required" });
    }

    const session = await mongoose.startSession();

    try {
        let updatedProduct;

        await session.withTransaction(async () => {
            const product = await Product.findById(productId).session(session);

            if (!product) {
                throw new Error("Product not found");
            }

            const previousQuantity = product.quantity;

            if (previousQuantity < quantity) {
                throw new Error("Insufficient stock available");
            }

            const newQuantity = previousQuantity - quantity;

            updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: productId,
                    quantity: { $gte: quantity }
                },
                { $inc: { quantity: -quantity } },
                { new: true, session, runValidators: true }
            );

            if (!updatedProduct) {
                throw new Error("Stock changed. Please try again.");
            }

            await InventoryTransaction.create([{
                product: productId,
                transactionType: "OUT",
                quantity,
                previousQuantity,
                newQuantity,
                reason,
                performedBy
            }], { session });
        });

        res.status(200).json({
            message: "Stock removed successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(400).json({ message: error.message });
    } finally {
        await session.endSession();
    }
};


// INVENTORY HISTORY
const getInventoryHistory = async (req, res) => {
    try {
        const history = await InventoryTransaction.find()
            .populate("product", "productCode productName")
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: history.length,
            history
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// STOCK ADJUSTMENT
const adjustStock = async (req, res) => {
    const { productId, newQuantity, reason, performedBy } = req.body;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({
            message: "Invalid product ID"
        });
    }

    if (!Number.isInteger(newQuantity) || newQuantity < 0) {
        return res.status(400).json({
            message: "New quantity must be a non-negative whole number"
        });
    }

    if (!reason || !performedBy) {
        return res.status(400).json({
            message: "Reason and staff name are required"
        });
    }

    const session = await mongoose.startSession();

    try {
        let updatedProduct;

        await session.withTransaction(async () => {
            const product = await Product.findById(productId).session(session);

            if (!product) {
                throw new Error("Product not found");
            }

            const previousQuantity = product.quantity;

            if (previousQuantity === newQuantity) {
                throw new Error("No adjustment needed. Stock is already correct.");
            }

            const difference = Math.abs(newQuantity - previousQuantity);

            updatedProduct = await Product.findOneAndUpdate(
                {
                    _id: productId,
                    quantity: previousQuantity
                },
                {
                    $set: { quantity: newQuantity }
                },
                {
                    new: true,
                    session,
                    runValidators: true
                }
            );

            if (!updatedProduct) {
                throw new Error("Stock changed. Please try again.");
            }

            await InventoryTransaction.create([{
                product: productId,
                transactionType: "ADJUSTMENT",
                quantity: difference,
                previousQuantity,
                newQuantity,
                reason,
                performedBy
            }], { session });
        });

        res.status(200).json({
            message: "Stock adjusted successfully",
            product: updatedProduct
        });

    } catch (error) {
        res.status(400).json({
            message: error.message
        });
    } finally {
        await session.endSession();
    }
};
// LOW STOCK MONITORING
const getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            status: "Active",
            $expr: {
                $lte: ["$quantity", "$lowStockLevel"]
            }
        }).sort({ quantity: 1 });

        const outOfStock = products.filter(
            product => product.quantity === 0
        );

        const lowStock = products.filter(
            product => product.quantity > 0
        );

        res.status(200).json({
            totalAlerts: products.length,
            outOfStockCount: outOfStock.length,
            lowStockCount: lowStock.length,
            outOfStock,
            lowStock
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    stockIn,
    stockOut,
    adjustStock,
    getInventoryHistory,
    getLowStockProducts
};