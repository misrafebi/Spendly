const mongoose = require('mongoose');
const { Schema } = mongoose;

const otpSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // TTL index: MongoDB auto-deletes this document 300 seconds after creation
    }
});
const Otp = mongoose.model('Otp', otpSchema)
module.exports = Otp