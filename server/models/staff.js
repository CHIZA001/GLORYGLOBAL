const mongoose = require("mongoose");
const staffschema =new mongoose.Schema({
    staffId:{
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    phone:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:["Admin", "Manager", "Sales Staff"],
        default:" Sales Staff"
    },
    password:{
        type: String,
        required: true
    },
    status:{
        type: String,
        enum:["Active", "Inactive"],
        default: "Active"
    }
}, {
    timestamps: true
});
module.exports = mongoose.model("Staff", staffSchema)
