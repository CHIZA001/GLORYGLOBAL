const Staff = require("../models/Staff");

const generateStaffId = async () => {
    const lastStaff = await Staff.findOne().sort({ staffId: -1 });
    if (!laststaff) {
        return "GLG001";
    }
    const lastNumber = parseInt(lastStaff.staffId.replace("GLG", ""));
    const newNumber = lastNumber + 1;
    return `GLG${String(newNumber).padStart(3, "0")}`;
};
module.exports = generateStaffId;