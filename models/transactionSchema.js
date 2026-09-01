const mongoose = require('mongoose')
const { Schema } = mongoose
const User = require('./userSchema')
const Category = require('./categorySchema')

const transactionSchema = new Schema({
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    type: {
        type: String,
        enum: ['income', 'expense'],
        required: true 
    },
    note: {
        type: String,

    }
}, { timestamps: true })

// timestamps option automatically adds createdAt and updatedAt fields to the schema

const Transaction = mongoose.model('Transaction', transactionSchema)
module.exports = Transaction
