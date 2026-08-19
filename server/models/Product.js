const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        productCode: {
            type: String,
            required: true,
            unique: true,
            trim: true
        },
        ProductName: {
            type: String,
            required: true,
            trim:true
        },
        category:{
            type: String,
            required: true,
            trim: true
        },
        supplier: {
            type: String,
            required:true,
            trim: true
        },
        costPrice: {
            type: Number,
            required:true,
            min:0
        },
        sellingPrice: {
            typew: Number,
            required: true,
            min: 0
        },
        quantity:{
            type: Number,
            default: 0,
            min: 0
        },
        lowStockLevel:{
            type: Number,
            default: 5,
            min: 0
        },
        description: {
            type: String,
            trim: true
        },
        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"

        }
    },
    {
        timestamps: true
    }


);
module.exports = mongoose.model("Product",productSchema);