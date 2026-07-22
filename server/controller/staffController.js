const Staff = require("../models/Staff");
const generateStaffId = require("../utils/generateStaffId");
const bcrypt = require("bcrypt");
const createStaff = async (req, res) => {
    try {
    const { fullName, email, phone, role, password, address, gender } = req.body;
    if(!fullName || !email || !phone || !password ||!address || !gender){
        return res.status(400).json({
            message: "Please provide all required fields"
        });
    }
    const existingStaff = await Staff.findOne({ email });

    if (existingStaff) {
        return res.status(400).json({
            message:"A staff member with this email already exists"
        });
    }
    const staffId = await generateStaffId();
    const hashedPassword = await bcrypt.hash(password, 10);
    const newStaff = new Staff({
        staffId,
        fullName,
        email,
        phone,
        role,
        password: hashedPassword,
        address,
        gender
    });
    await newStaff.save();
    res.status(201).json({
        message: "Staff member created successfully",
        staff:{
            staffId: newStaff.staffId,
            fullName:newStaff. fullName,
            email: newStaff.email,
            phone: newStaff.phone,
            role: newStaff.role,
            address: newStaff.address,
            gender: newStaff.gender
        }
    });
} catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({
        message: "Server error while creating staff"
    });
}
};
module.exports = { createStaff};