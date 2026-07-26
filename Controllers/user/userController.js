
const loadDashBoard = async (req, res) => {
    try {
        res.render('dashboard')
    } catch (error) {
        console.log('not found dashboard');
        res.status(500).send('server error')
    }
}



const loadPageNotFound = async (req, res) => {
    try {
        res.render('pageNotFound')
    }
    catch (error) {
       res.redirect('/user/page-not-found')
        res.status(500).send('server error')
    }
}
module.exports = {
    loadDashBoard,
    loadPageNotFound,
}