const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { 
    createStaff, 
    getAllStaff,
    getStaffById,
    updateStaff,
    deactivateStaff,
    loginStaff
 }
  = require("../controller/staffController");
const router = express.Router();
router.post("/", createStaff);
// Get all staff
router.get("/", authMiddleware, getAllStaff);
// Get one staff by Staff ID
router.get("/:staffId", getStaffById);
// update the staff 
router.put("/:staffId", updateStaff);
// Delete or rather Deactivate Account
router.patch("/:staffId/deactivate", deactivateStaff);
// Login for staff memebers

module.exports = router;
router.post("/login",loginStaff);