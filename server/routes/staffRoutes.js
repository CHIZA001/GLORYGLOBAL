const express = require("express");
const { createStaff } = require("../controller/staffController");
const router = express.Router()
router.post("/", createStaff);
module.exports = router;