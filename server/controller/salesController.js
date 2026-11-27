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

// GET ALL SALES WITH SEARCH AND FILTERS
const getAllSales = async (req, res) => {
    try {
        const {
            search,
            salesperson,
            paymentStatus,
            startDate,
            endDate
        } = req.query;

        const filter = {};

        // SEARCH BY SALE NUMBER OR CUSTOMER
        if (search) {
            filter.$or = [
                { saleNumber: { $regex: search, $options: "i" } },
                { customerName: { $regex: search, $options: "i" } }
            ];
        }

        // FILTER BY SALESPERSON
        if (salesperson) {
            filter.salesperson = {
                $regex: salesperson,
                $options: "i"
            };
        }

        // FILTER BY PAYMENT STATUS
        if (paymentStatus) {
            filter.paymentStatus = paymentStatus.toUpperCase();
        }

        // FILTER BY DATE
        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        const sales = await Sale.find(filter)
            .sort({ createdAt: -1 });

        res.status(200).json({
            count: sales.length,
            sales
        });

    } catch (error) {
        console.error("Get sales error:", error);

        res.status(500).json({
            message: "Failed to retrieve sales",
            error: error.message
        });
    }
};
// GET INDIVIDUAL SALE DETAILS
const getSaleBySaleNumber = async (req, res) => {
    try {
        const { saleNumber } = req.params;

        const sale = await Sale.findOne({ saleNumber })
            .populate("items.product", "productCode productName");

        if (!sale) {
            return res.status(404).json({
                message: "Sale not found"
            });
        }

        res.status(200).json({
            message: "Sale retrieved successfully",
            sale
        });

    } catch (error) {
        console.error("Get individual sale error:", error);

        res.status(500).json({
            message: "Failed to retrieve sale",
            error: error.message
        });
    }
};
// RECORD ADDITIONAL PAYMENT
const addSalePayment = async (req, res) => {
    try {
        const { saleNumber } = req.params;
        const { amount, paymentMethod, receivedBy, reference } = req.body;

        // Validate payment amount
        if (
            typeof amount !== "number" ||
            !Number.isFinite(amount) ||
            amount <= 0
        ) {
            return res.status(400).json({
                message: "Enter a valid payment amount"
            });
        }

        // Validate payment method
        if (!["Cash", "Transfer", "POS"].includes(paymentMethod)) {
            return res.status(400).json({
                message: "Invalid payment method"
            });
        }

        // Validate receiver
        if (typeof receivedBy !== "string" || !receivedBy.trim()) {
            return res.status(400).json({
                message: "Person receiving payment is required"
            });
        }

        const sale = await Sale.findOne({ saleNumber });

        if (!sale) {
            return res.status(404).json({
                message: "Sale not found"
            });
        }

        if (sale.balanceDue <= 0) {
            return res.status(400).json({
                message: "This sale has already been fully paid"
            });
        }

        if (amount > sale.balanceDue) {
            return res.status(400).json({
                message: `Payment exceeds outstanding balance of ${sale.balanceDue}`
            });
        }

        // Add payment record
        sale.payments.push({
            amount,
            paymentMethod,
            receivedBy: receivedBy.trim(),
            reference: reference || "",
            paidAt: new Date()
        });

        // Update payment totals
        sale.amountPaid = Number(
            (sale.amountPaid + amount).toFixed(2)
        );

        sale.balanceDue = Number(
            (sale.totalAmount - sale.amountPaid).toFixed(2)
        );

        // Update payment status
        if (sale.balanceDue === 0) {
            sale.paymentStatus = "PAID";
        } else {
            sale.paymentStatus = "PARTIALLY_PAID";
        }

        await sale.save();

        res.status(200).json({
            message: "Payment recorded successfully",
            sale
        });

    } catch (error) {
        console.error("Add sale payment error:", error);

        res.status(500).json({
            message: "Failed to record payment",
            error: error.message
        });
    }
};
module.exports = {
    createSale,
    getAllSales,
    getSaleBySaleNumber,
    addSalePayment
};
