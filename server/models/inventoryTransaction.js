const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        transactionType: {
            type: String,
            enum: ["IN", "OUT", "ADJUSTMENT"],
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        previousQuantity: {
            type: Number,
            required: true
        },

        newQuantity: {
            type: Number,
            required: true
        },

        reason: {
            type: String,
            required: true,
            trim: true
        },

        performedBy: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "InventoryTransaction",
    inventoryTransactionSchema
);