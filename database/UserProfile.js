const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
    userid : String,
    username : {
        type : String,
        unique : true,
        required : true
    },
    email : {
        type: String,
        trim: true,
        lowercase: true,
    },
    address : String,
    image: String,
})

module.exports = mongoose.model('Userprofile',userProfileSchema);