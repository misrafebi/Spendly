
const User = require('../../models/userSchema')

const loadPageNotFound = async (req, res) => {
    try {
        res.render('pageNotFound')
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the page not found page. Please try again shortly.'
        })
    }
}

const loadAboutUsPage = async (req, res) => {
    try {
        res.render('aboutUs')
    } catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the about us page. Please try again shortly.'
        })

    }
}


const loadLoginPage = async (req, res) => {
    try {
        res.render('login')
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the login page. Please try again shortly.'
        })
    }
}

const loadSignUpPage = async (req, res) => {
    try {
        res.render('signup')
    }
    catch (error) {
        return res.status(500).render('pageNotFound', {
        message: 'Something went wrong while loading the signup page.'
    })
    }
}

const signup = async (req, res) => {
    const { fullName, email, password ,confirmPassword} = req.body
    try {
        const newUser = new User({ name:fullName,
             email,
              password })
       await newUser.save()

        return res.redirect('/user/signup')

    } catch (error) {
        return res.status(500).render('pageNotFound', {
        message: 'Something went wrong while loading the signup page.'
    })
    }
}

const loadOtpPage=async(req,res)=>{
    try {

        res.render('otp')

    } catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading otp page. Please try again shortly.'
        })
    }
}

const loadChangePasswordPage = async (req, res) => {
    try {
        res.render('changePassword')
    }
    catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the change password page. Please try again shortly.'
        })
    }
}



module.exports = {
    loadPageNotFound,
    loadAboutUsPage,
    loadLoginPage,
    loadSignUpPage,
    loadChangePasswordPage,
    signup,
    loadOtpPage,
    
}