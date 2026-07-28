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
//This code for collection of all the staff Id in the database for history check purpose
const getAllStaff = async (req, res) => {
    try{
        const staff = await Staff.find().select("-password");

        res.status(200).json({
            count: staff.length,
            staff
        });
    } catch (error) {
        console.error("Error fetching staff:", error);
        res.status(500).json({
            message: "server error while fetching staff"
        });
    }
};
module.exports = { 
    createStaff,
    getAllStaff
};
const updateStaff = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedStaff = await Staff.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        if (!updatedStaff) {
            return res.status(404).json({
                message: "Staff not found"
            });
        }

        res.status(200).json({
            message: "Staff updated successfully",
            staff: updatedStaff
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};