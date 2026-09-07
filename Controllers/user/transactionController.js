const { name } = require('ejs');
const Category = require('../../models/categorySchema');
const Transaction = require('../../models/transactionSchema');
const User = require('../../models/userSchema');
const { default: mongoose } = require('mongoose');
const { use } = require('react');

const loadTransactionPage = async (req, res) => {
    try {
        const email = req.session.userData

        const user = await User.findOne({ email })

        const categories = await Category.find({
            $or: [{ User: null }, { User: user._id }]
        })

        const transactions = await Transaction.find({ user }).populate('category')
        //populate() it so Mongoose replaces the id with the actual category document.

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

const editTransaction = async (req, res) => {
    try {
        const { id } = req.params

        const { amount, category, date, note, type } = req.body
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid transaction id.'
            })
        }

        const email = req.session.userData
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'User not found.'
            })
        }
        if (!category || !amount || !date || !type) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required.'
            })
        }

        // ////// ANOTHER METHOD
        // let categoryId = category
        //      if (!mongoose.Types.ObjectId.isValid(category)) {
        //          const categoryDoc = await Category.findOne({ name: category })
        //          if (!categoryDoc) {
        //              return res.status(400).json({
        //                  success: false,
        //                  message: 'Category not found.'
        //                 })
        //          }
        //          categoryId = categoryDoc._id
        //         }

        const selectedCategory = await Category.findOne({ name: category }) // category object
        if (!selectedCategory) {
            return res.status(404).json({
                success: false,
                message: 'Category not found.'
            })
        }
        const categoryId = selectedCategory._id // category object id
        // {category}=req.boy => gives category name Ex: Salary
        // here need category id  

        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: id, user: user._id },
            {
                amount,
                category: categoryId,
                date,
                note,
                type
            },
            { new: true, runValidators: true }
        )
        if (!updatedTransaction) {
            return res.status(404).json({
                success: false,
                message: 'Transacton not found.'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Edited seccessfully.'
        })
    } catch (error) {
        console.error('Something went wrong while editing transaction.', error)
        return res.status(404).json({
            success: false,
            message: "Something went wrong while editing transaction."
        })
    }
}

const deleteTransaction = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(500).json({
                success: false,
                message: 'Missing Params.'
            })
        }

        const email = req.session.userData
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            })
        }

        const transaction = await Transaction.findById(id)
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.'
            })
        }

        if (transaction.user.toString() !== user._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You cannot delete this transaction'
            })
        }

        await Transaction.deleteOne({ _id: id })
        return res.status(200).json({
            success: true,
            message: 'Deleted successfully.'
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while delting transaciton.'
        })
    }
}
module.exports = {
    loadTransactionPage,
    addTransaction,
    editTransaction,
    deleteTransaction
}