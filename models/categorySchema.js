const mongoose = require('mongoose');
const User = require('./userSchema');
const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    User: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null // null = admin-created, visible to every user
    }
})
 
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
