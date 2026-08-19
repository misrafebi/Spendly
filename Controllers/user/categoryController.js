const User = require('../../models/userSchema')

const laodCategoryPage = async (req, res) => {
    try {
        const email = req.session.userData
        console.log('email: ', email);

        const user = await User.findOne({ email })
        console.log('user: ', user);

        res.render('categories', {
            activePage:'category',
            user
        })
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the category page. Please try again shortly.'
        })
    }
}

module.exports = {
    laodCategoryPage
}