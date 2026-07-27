const laodCategoryPage=async(req,res)=>{
    try {
        res.render('category')
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the category page. Please try again shortly.'
        })
    }
}

module.exports={
    laodCategoryPage
}