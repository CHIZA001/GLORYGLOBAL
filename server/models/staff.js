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
        enum:[
            "Admin", 
            "Manager", 
            "Sales Staff",
            "Store Keeper",
        ],
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
    },
    address:{
        type: String,
        required: true

    },
    gender:{
        type: String,
        enum:["Male","Female"],
        required:true
    },
    profileImage:{
        type: String,
        default:""
    },
}, {
    timestamps: true
});
module.exports = mongoose.model("Staff", staffSchema)
