const loadTransactionPage = async (req, res) => {
    try {
        res.render('transaction')
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the transaction page. Please try again shortly.'
        })
    }
}

module.exports = {
    loadTransactionPage
}