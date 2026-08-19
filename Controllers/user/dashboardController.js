const User = require('../../models/userSchema')

const loadDashBoard = async (req, res) => {
    try {
        const email = req.session.userData
        console.log('email: ', email);

        const user = await User.findOne({ email })
        console.log('user: ', user);

        res.render('dashboard',{
            activePage:'dashboard',
            user
        })
    } catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the dashboard page. Please try again shortly.'
        })
    }
}

module.exports = {
    loadDashBoard
}