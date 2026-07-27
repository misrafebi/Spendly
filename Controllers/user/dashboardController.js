const loadDashBoard = async (req, res) => {
    try {
        res.render('dashboard')
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