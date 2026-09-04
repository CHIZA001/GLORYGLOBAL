const Product = require("../models/Product");
// const express = require("express");
// Create a new product
const createProduct = async (req, res) => {
    try {
        const {
            productCode,
            productName,
            category,
            supplier,
            costPrice,
            sellingPrice,
            quantity,
            lowStockLevel,
            description
        } = req.body;

        if (
            !productCode ||
            !productName ||
            !category ||
            !supplier ||
            costPrice === undefined ||
            sellingPrice === undefined
        ) {
            return res.status(400).json({
                message: "Please provide all required product fields"
            });
        }

        const existingProduct = await Product.findOne({ productCode });

        if (existingProduct) {
            return res.status(400).json({
                message: "A product with this product code already exists"
            });
        }

        const newProduct = new Product({
            productCode,
            productName,
            category,
            supplier,
            costPrice,
            sellingPrice,
            quantity: quantity || 0,
            lowStockLevel: lowStockLevel || 5,
            description
        });

        await newProduct.save();

        res.status(201).json({
            message: "Product created successfully",
            product: newProduct
        });

    } catch (error) {
        console.error("Error creating product:", error);

        res.status(500).json({
            message: "Server error while creating product"
        });
    }
};
const getAllProducts = async (req, res) => {
    try{
        const products = await Product.find();
        res.status(200).json({
            count: products.length,
            products
        });
    } catch (error){
        console.error("Error fetching products:", error);
        
        res.status(500).json({
            message:"Server error while fetching"
        });
    }
};
const getProductByCode = async (req, res) => {
    try {
        const { productCode } = req.params;

        const product = await Product.findOne({ productCode });

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        res.status(200).json({
            product
        });

    } catch (error) {
        console.error("Error fetching product:", error);

        res.status(500).json({
            message: "Server error while fetching product"
        });
    }
};
module.exports = {
    createProduct,
    getAllProducts,
    getProductByCode
};