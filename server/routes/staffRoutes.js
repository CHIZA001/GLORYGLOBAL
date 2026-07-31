const express = require("express");
const { 
    createStaff, 
    getAllStaff,
    getStaffById,
    updateStaff,
    deactivateStaff   
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
// Delete or rather Deactivate Account
router.patch("/:staffId/deactivate", deactivateStaff);
module.exports = router;
