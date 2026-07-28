const express = require("express");
const { createStaff, getAllStaff } = require("../controller/staffController");
const router = express.Router();
router.post("/", createStaff);
router.get("/", getAllstaff);
module.exports = router;