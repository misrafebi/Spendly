
const User = require('../../models/userSchema')
const bcrypt = require('bcrypt')
const { log } = require('console')
const crypto = require('crypto')
const nodemailer = require('nodemailer')

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

const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email && !password) {
            console.log('Email or password is requiered.');
            return res.redirect('/user/login?message:Email or password is requiered.&type=error')
        }

        const user = await User.findOne({ email })
        if (!user) {
            console.log('Can not found user.');
            return res.redirect('/user/login?message=Can not found user.&type=error')
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log('Incorrect password.');
            return res.redirect('/user/login?message=Incorrect password. Please try again later.&type=error')
        }

        req.session.userData = email

        res.render('dashboard')
    } catch (error) {
        return res.status(500).redirect('pageNotFound', {
            message: 'Something wend wrong while login, Please try again later.'
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
    const { fullName, email, password, confirmPassword } = req.body
    try {

        if (password !== confirmPassword) {
            return res.redirect('/user/signup?message=Password do not match&type=error')
        }

        const findUser = await User.findOne({ email })
        if (findUser) {
            console.log('User already exists');

            return res.redirect('/user/signup?message=User already exists.&type=error')
        }

        const otp = generateOtp()
        console.log(otp);

        const sentMail = await sendVerifyMail(email, otp)
        console.log('Mail sent: ', sentMail);


        if (!sentMail) {
            console.log('Failed to send OTP. Please try again later.');
            return res.redirect('/user/signup?message=Failed to send OTP. Please try again later.&type=error')
        }

        req.session.userOtp = otp
        req.session.userData = { fullName, email, password }

        return res.render('otp')


    } catch (error) {
        return res.status(500).render('pageNotFound', {
            message: 'Something went wrong while loading the signup page.'
        })
    }
}

function generateOtp() {
    const otp = crypto.randomInt(100000, 1000000).toString()
    return otp
}

async function sendVerifyMail(email, otp) {

    try {
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        })

        const info = transport.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Verify OTP',
            text: `Your OTP is ${otp}`,
            html: `<b>Your OTP is ${otp}</b>`
        })
        console.log(info);

        return true

        // return info.accepted.length > 0
    } catch (error) {
        console.log(error);
        return false;
    }
}

const loadOtpPage = async (req, res) => {
    try {

        return res.render('otp')

    } catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading otp page. Please try again shortly.'
        })
    }
}

const verifyOtp = async (req, res) => {
    const { otp } = req.body
    try {
        if (otp === req.session.userOtp) {
            console.log("Entered OTP:", otp)
            console.log("Session OTP:", req.session.userOtp)

            req.session.user = true
            const user = req.session.userData

            const hashedPassword = await bcrypt.hash(user.password, 10)

            const newUser = new User({
                name: user.fullName,
                email: user.email,
                password: hashedPassword
            })

            await newUser.save()

            req.session.user = newUser._id

            const email = req.session.userData?.email
            req.session.userData = email

            return res.render('dashboard')
        } else {
            return res.redirect('/user/verify-otp?message=Invalid OTP&type=error')
        }
    } catch (error) {
        return res.status(500).render('pageNotFound', {
            message: 'Something went wrong while verifying otp. '
        })
    }
}

const resendOtp = async (req, res) => {
    try {
        const email = req.session.userData?.email

        const otp = generateOtp()
        console.log('OTP', otp);


        const sendMail = await sendVerifyMail(email, otp)
        console.log('Email send: ', sendMail);

        if (!sendMail) {
            return res.status(500).json({
                success: false,
                message: 'Cannot send OTP to your email. Please try again later.'
            })

        }
        req.session.userOtp = otp
        console.log('New session OTP :', req.session.userOtp);

        return res.status(200).json({
            success: true,
            message: 'OTP resent successfully.'
        })


    } catch (error) {
        console.error("Resend OTP error:", error)
        return res.status(500).json({
            success: false,
            message: 'Something went wrong while resending OTP.'
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
    verifyOtp,
    resendOtp,
    login
}