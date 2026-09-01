const Category = require('../../models/categorySchema');
const Transaction = require('../../models/transactionSchema');
const User = require('../../models/userSchema')

const loadTransactionPage = async (req, res) => {
    try {
        const email = req.session.userData

        const user = await User.findOne({ email })

        const categories = await Category.find({
            $or: [{ User: null }, { User: user._id }]
        })

        const transactions = await Transaction.find({user}).populate('category')

        res.render('transaction', {
            activePage: 'transaction',
            user,
            categories,
            transactions
        })
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the transaction page. Please try again shortly.'
        })
    }
}

// Add transaction
const addTransaction = async (req, res) => {
    try {
        const { amount, category, date, note, type } = req.body
        const email = req.session.userData
        const user = await User.findOne({ email })

        if (!amount || !category || !date || !type) {
            console.log('All fields are required.');
            return res.redirect('/user/transaction?message=All fields are required.&type=error')
        }

        if (isNaN(amount)) {
            console.log('NOT A NUMBER');
            return res.redirect('/user/transaction?message=Amount must be a number.&type=error')
        }

        const newTransaction = new Transaction({
            amount,
            category,
            date,
            note,
            type,
            user: user
        })
        await newTransaction.save()

        return res.redirect('/user/transaction?message=New transaction added successfully.&type=success')

    } catch (error) {
        console.log(error);

    }

}

module.exports = {
    loadTransactionPage,
    addTransaction
}