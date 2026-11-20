const mongoose = require("mongoose");

const Product = require("../models/Product");
const Sale = require("../models/sale");
const InventoryTransaction = require("../models/inventoryTransaction.js");

// CREATE SALE
const createSale = async (req, res) => {
    const {
        customerName,
        customerPhone,
        salesperson,
        items,
        amountPaid = 0,
        paymentMethod,
        dueDate,
        notes
    } = req.body;

    // VALIDATION
    if (!salesperson || !salesperson.trim()) {
        return res.status(400).json({
            message: "Salesperson name is required"
        });
    }

    if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
            message: "At least one product is required"
        });
    }

    if (!Number.isFinite(amountPaid) || amountPaid < 0) {
        return res.status(400).json({
            message: "Invalid payment amount"
        });
    }

    if (
        amountPaid > 0 &&
        !["Cash", "Transfer", "POS"].includes(paymentMethod)
    ) {
        return res.status(400).json({
            message: "A valid payment method is required"
        });
    }

    for (const item of items) {
        if (
            !mongoose.isValidObjectId(item.productId) ||
            !Number.isInteger(item.quantity) ||
            item.quantity <= 0
        ) {
            return res.status(400).json({
                message: "Invalid product ID or quantity"
            });
        }
    }

    const session = await mongoose.startSession();

    try {
        let savedSale;

        await session.withTransaction(async () => {

            const saleNumber =
                `GLG-SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            let totalAmount = 0;
            let totalCost = 0;

            const saleItems = [];

            // PROCESS EACH PRODUCT
            for (const item of items) {

                const product = await Product.findById(
                    item.productId
                ).session(session);

                if (!product) {
                    throw new Error(
                        `Product not found: ${item.productId}`
                    );
                }

                if (product.status !== "Active") {
                    throw new Error(
                        `${product.productName} is inactive`
                    );
                }

                const previousQuantity = product.quantity;

                if (previousQuantity < item.quantity) {
                    throw new Error(
                        `Insufficient stock for ${product.productName}. Available: ${previousQuantity}`
                    );
                }

                const newQuantity =
                    previousQuantity - item.quantity;

                // CALCULATE PRICES FROM DATABASE
                const unitPrice = product.sellingPrice;
                const unitCost = product.costPrice;

                const itemTotal =
                    unitPrice * item.quantity;

                const itemCost =
                    unitCost * item.quantity;

                const itemProfit =
                    itemTotal - itemCost;

                totalAmount += itemTotal;
                totalCost += itemCost;

                // DEDUCT INVENTORY
                const updatedProduct =
                    await Product.findOneAndUpdate(
                        {
                            _id: product._id,
                            quantity: { $gte: item.quantity }
                        },
                        {
                            $inc: {
                                quantity: -item.quantity
                            }
                        },
                        {
                            new: true,
                            session,
                            runValidators: true
                        }
                    );

                if (!updatedProduct) {
                    throw new Error(
                        `Stock changed for ${product.productName}. Try again.`
                    );
                }

                // RECORD INVENTORY TRANSACTION
                await InventoryTransaction.create([{
                    product: product._id,
                    transactionType: "OUT",
                    quantity: item.quantity,
                    previousQuantity,
                    newQuantity,
                    reason: `Sale ${saleNumber}`,
                    performedBy: salesperson
                }], { session });

                // SAVE SALE ITEM
                saleItems.push({
                    product: product._id,
                    productCode: product.productCode,
                    productName: product.productName,
                    quantity: item.quantity,
                    unitPrice,
                    unitCost,
                    total: itemTotal,
                    profit: itemProfit
                });
            }

            // PAYMENT VALIDATION
            if (amountPaid > totalAmount) {
                throw new Error(
                    "Payment cannot exceed the total sale amount"
                );
            }

            const balanceDue = totalAmount - amountPaid;

            let paymentStatus = "UNPAID";

            if (amountPaid === totalAmount) {
                paymentStatus = "PAID";
            } else if (amountPaid > 0) {
                paymentStatus = "PARTIALLY_PAID";
            }

            // SAVE INITIAL PAYMENT
            const payments = [];

            if (amountPaid > 0) {
                payments.push({
                    amount: amountPaid,
                    paymentMethod,
                    receivedBy: salesperson,
                    paidAt: new Date()
                });
            }

            // CREATE SALE RECORD
            const sale = await Sale.create([{
                saleNumber,

                customerName:
                    customerName || "Walk-in Customer",

                customerPhone: customerPhone || "",

                salesperson,

                items: saleItems,

                totalAmount,
                totalCost,

                grossProfit: totalAmount - totalCost,

                amountPaid,
                balanceDue,
                paymentStatus,

                payments,

                dueDate: dueDate || null,
                notes: notes || ""

            }], { session });

            savedSale = sale[0];
        });

        res.status(201).json({
            message: "Sale recorded successfully",
            sale: savedSale
        });

    } catch (error) {

        res.status(400).json({
            message: error.message
        });

    } finally {
        await session.endSession();
    }
};

module.exports = {
    createSale
};