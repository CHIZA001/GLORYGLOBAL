const staff = require("../models/Staff");
const generateStaffId = require("../utils/generateStaffId");
const bcrypt = require("bcrypt");
const createStaff = async (req, res) => {
    const { fullName, email, phone, role, password, address, gender } = req.body;
    if(!fullName || !email || !phone || !password ||!address || !gender){
        return res.status(400).json({
            message: "Please provide all required fields"
        });
    }