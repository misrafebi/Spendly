const Transaction = require('../../models/transactionSchema')
const User = require('../../models/userSchema')

const loadDashBoard = async (req, res) => {
    try {
        const email = req.session.userData
        const user = await User.findOne({ email })

        const recent = await Transaction.find({ user })
            .populate('category')
            .sort({ date: -1 })
            .limit(5)

        res.render('dashboard', {
            activePage: 'dashboard',
            user,
            recent
        })

    } catch (error) {
        console.error(error)
        res.render('pageNotFound', {
            message: 'Something went wrong while loading the dashboard page. Please try again shortly.'
        })
    }
}

const getMonthlySummary = async (req, res) => {
    try {
        const email = req.session.userData
        const user = await User.findOne({ email })

        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const results = await Transaction.aggregate([
            { $match: { user: user._id, date: { $gte: startOfMonth } } },
            { $group: { _id: '$type', total: { $sum: '$amount' } } }
        ])

        let income = 0, expense = 0

        results.forEach(r => {
            if (r._id === 'income') income = r.total
            if (r._id === 'expense') expense = r.total
        })

        res.json({
            income, expense, balance: income - expense
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to load summary' })
    }
}

const getCategorySummary=async(req,res)=>{
    try {
        const email=req.session.userData
        const user=await User.findOne({email})

        const startOfMonth=new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0,0,0,0)

        const results= await Transaction.aggregate([
            {$match:{user:user._id, type:'expense', date:{$gte:startOfMonth}}},
            {$group:{_id:'$category', total:{$sum:'$amount'}}},
            {$lookup:{
                from:'categories',
                localField:'_id',
                foreignField:'_id',
                as:'categoryInfo'
            }},
            {$unwind:'$categoryInfo'},
            {_id:0,name:'$categoryInfo.name',total:1}
        ])

        res.json({
            labels:results.map(r=>r.name),
            values:results.map(r=>r.total)
        })
    } catch (error) {
        console.error(error)
        res.status(500).json({ error: 'Failed to load category summary' })
    }
}

module.exports = {
    loadDashBoard,
    getMonthlySummary,
    getCategorySummary
}