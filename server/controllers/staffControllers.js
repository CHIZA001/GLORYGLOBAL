const Staff = require("../models/Staff");
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
    const existingStaff = await Staff.findOne({ email });

    if (existingStaff) {
        return res.status(400).json({
            meessage:"A staff member with this email already exists"
        });
    }