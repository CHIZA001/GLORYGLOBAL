const express = require("express");
const { 
    createStaff, 
    getAllStaff,
    getStaffById,
    updateStaff    
 }
  = require("../controller/staffController");
const router = express.Router();
router.post("/", createStaff);
// Get all staff
router.get("/", getAllStaff);
// Get one staff by Staff ID
router.get("/:staffId", getStaffById);
// update the staff 
router.put("/:staffId", updateStaff);
module.exports = router;
