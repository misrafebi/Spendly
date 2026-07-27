const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    gooleId: {
        type: String,
        unique: true
    },
    password:{
        type: String,
        required: false
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    category: [{
        type:Schema.Types.ObjectId,
        ref:'Category'
    }],
    createdOn:{
        type:Date,
        default:Date.now
    },
    referalCode:{
        type:String,
    },
    redeemed:{
        type:Boolean,
    },
    redeemedUser:[{
        type:Schema.Types.ObjectId,
        ref:'User'
    }]

})

const User= mongoose.model('User', userSchema);
module.exports = User

