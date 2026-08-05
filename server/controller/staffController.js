const Staff = require("../models/Staff");
const generateStaffId = require("../utils/generateStaffId");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
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
const getStaffById = async (req, res) => {
    try {
        const { staffId } = req.params;
        const staff = await Staff.findOne({ staffId }).select("-password");
        if (!staff) {
            return res.status(404).json({
                message: "Staff not found"
            });
        }
        res.status(200).json(staff);
    }
    catch (error){
        console.error("Error fetching staff:", error);
        res.status(500).json({
            message:"Server error while fetching staff"
        });
    }
};
// updating to Exsiting Staff Id
const updateStaff = async (req, res) => {
    try {
        const { staffId } = req.params;

        const updatedStaff = await Staff.findOneAndUpdate(
            { staffId },
            req.body,
            {
                new: true,
                runValidators: true
            }
        ).select("-password");
        if (!updatedStaff) {
            return res.status(404).json({
                message: "Staff not found"
            });
        }
        res.status(200).json({
            message: "Staff updated Successfully",
            staff: updatedStaff
        });

    }
    catch (error) {
        console.error("Error Updating staff:", error);
        res.status(500).json({
            message: "Server error while updating staff Try Again."
        });
    }
};
//Delete or rather Deactivating the account of the staff data or user
const deactivateStaff = async (req, res) => {
    try {
        const { staffId } = req.params;
        const staff = await Staff.findOne({ staffId });

        if (!staff) {
            return res.status(404).json({
                message:"Staff not found."
            });
        }
        staff.status = "Inactive";
        await staff.save();
        res.status(200).json({
            message: "Staff deactivated Successfully. Thank you!",
            staff:staff
        });

    } catch (error){
        console.error("Error deactivating staff:",error);
        res.status(500).json({
            message:"Server error while deactivating staff Acount Check again!."            
        });
    }
};
// For Logining and error control
const loginStaff = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password){
            return res.status(400).json({
                message:"Email and password are required."
            });
        }

       const staff = await Staff.findOne({ email });
       if (!staff){
        return res.status(404).json({
            message: "Invalid email or password."
        });

       }
       if (staff.status ==="Inactive"){
        return res.status(403).json({
            message:"This staff account has been deactivated."
            });
       }
       const isPasswordCorrect = await bcrypt.compare(
        password,
        staff.password
       );
       if (!isPasswordCorrect) {
        return res.status(401).json({
            message: "Invalid email or password."
        });
        
       }
       const token = jwt.sign(
        {
            staffId: staff.staffId,
            role: staff.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn:"7d"
        }
       );
       res.status(200).json({
        message:"Login successful.",
        token,
        staff: {
            staffId: staff.staffId,
            fullName: staff.fullName,
            email: staff.email,
            role: staff.role
        }
       });    
    } catch (error){
        console.error("Login error:", error);
        res.status(500).json({
            message:"Server error while logging in, something is wrong."
        });
    }
   
};
module.exports = { 
    createStaff,
    getAllStaff,
    getStaffById,
    updateStaff,
    deactivateStaff,
    loginStaff
};
