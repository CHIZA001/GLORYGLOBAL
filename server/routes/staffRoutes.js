const express = require("express");
const { createStaff, getAllStaff } = require("../controller/staffController");
const router = express.Router();
router.post("/", createStaff);
// creates a new endpoint
router.get("/", getAllStaff);
module.exports = router;