const express = require("express");
const { 
    createStaff, 
    getAllStaff,
    getStaffById,
    updateStaffById    
 }
  = require("../controller/staffController");
const router = express.Router();
router.post("/", createStaff);
// Get all staff
router.get("/", getAllStaff);
// Get one staff by Staff ID
router.get("/:staffId", getStaffById);
module.exports = router;