const express = require("express");
const roleMiddleware = require("../middleware/roleMiddleware");
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
router.put(
  "/:staffId",
  authMiddleware,
  roleMiddleware("Admin", "Manager"),
   updateStaff
  );
// Delete or rather Deactivate Account
router.patch(
  "/:staffId/deactivate", 
  authMiddleware,
  roleMiddleware("Admin"),
  deactivateStaff
);
// Login for staff memebers
router.post("/login",loginStaff);

module.exports = router;
