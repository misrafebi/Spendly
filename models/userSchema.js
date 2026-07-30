const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: false // password is not required for Google login users
    },
    gooleId: {
        type: String,
        unique: true,
        sparse: true // allows many users to have no googleId without violating uniqueness
    },
    isVerified: {
        type: Boolean,
        default: false // flips to true after OTP verification succeeds
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    createdOn: {
        type: Date,
        default: Date.now
    },

})

const User = mongoose.model('User', userSchema);
module.exports = User

