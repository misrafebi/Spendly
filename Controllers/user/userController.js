
const User = require('../../models/userSchema')
const bcrypt = require('bcrypt')
const { log } = require('console')
const crypto = require('crypto')
const nodemailer = require('nodemailer')
const { send } = require('process')


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
        const email = req.session.userData
        console.log('email: ', email);

        const user = await User.findOne({ email })
        console.log('user: ', user);

        res.render('aboutUs', {
            activePage: 'about-us',
            user
        })
    } catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading the about us page. Please try again shortly.'
        })

    }
}


////// LOGIN

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

        const blocked = user.isBlocked
        if (blocked) {
            console.log('user blocked');
            return res.redirect('/user/login?message=User has been blocked, Please contact support.&type=error')
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            console.log('Incorrect password.');
            return res.redirect('/user/login?message=Incorrect password.&type=error')
        }

        req.session.userData = email

        res.redirect('/user/dashboard?message=User login successfuly.&type=success')

    } catch (error) {
        return res.status(500).redirect('pageNotFound', {
            message: 'Something wend wrong while login, Please try again later.'
        })
    }
}


//////

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

        console.log('Mail sent successfully:', info.messageId)
        // console.log(info);

        return true

        // return info.accepted.length > 0
    } catch (error) {
        console.log(error);
        return false;
    }
}
///////


///// SIGNUP

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

        console.log('!sentmail');


        req.session.userOtp = otp
        req.session.userData = { fullName, email, password }

        return res.redirect('/user/verify-signup-otp?message=Enter Your OTP.&type=success')

    } catch (error) {
        return res.status(500).render('pageNotFound', {
            message: 'Something went wrong while loading the signup page.'
        })
    }
}


const loadSignupOtpPage = async (req, res) => {
    try {

        return res.render('signup-otp')

    } catch (error) {
        res.status(500).send('server error')
        res.render('user/pageNotFound', {
            message: 'Something went wrong while loading otp page. Please try again shortly.'
        })
    }
}

const verifySignupOtp = async (req, res) => {
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

            return res.redirect('/user/dashboard?message=Signup successfully.&type=error')

        } else {
            return res.redirect('/user/verify-signup-otp?message=Invalid OTP&type=error')
        }

    } catch (error) {
        return res.status(500).render('pageNotFound', {
            message: 'Something went wrong while verifying otp. '
        })
    }
}


const resendSignupOtp = async (req, res) => {
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

////// CHANGE PASSWORD

const loadChangePasswordPage = async (req, res) => {
    try {

        const email = req.session.userData

        const user = await User.findOne({ email })
        return res.render('changePassword', {
            user,
            activePage: 'change-password'
        })

    } catch (error) {
        return console.log(error);

    }
}

const changePassword = async (req, res) => {
    try {

        const { currentPassword, newPassword, confirmNewPassword } = req.body

        const email = req.session.userData
        if (!email) {
            console.log('email is not found');
            return res.redirect('/user/change-password?message=Email not found. Please login again.&type=error')
        }

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            console.log('passwords are empty');
            return res.redirect('/user/change-password?message=All password fields are required.&type=error')
        }

        if (newPassword !== confirmNewPassword) {
            console.log('Password do not match.');
            return res.redirect('/user/change-password?message=Password do not match.&type=error')
        }

        const user = await User.findOne({ email })
        if (!user) {
            console.log('user is not found');
            return res.redirect('/user/change-password?message=User is not found.')
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            console.log('Incorrect password ');
            return res.redirect('/user/change-password?message=Incorrect password.&type=error')
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password)
        if (isSamePassword) {
            console.log();
            return res.redirect('/user/change-password?message=New password cannot be the same as your current password.&type=error')
        }

        const otp = generateOtp()
        console.log('OTP : ', otp);

        const sentMail = await sendVerifyMail(email, otp)
        console.log('Mail sent: ', sentMail);
        if (!sentMail) {
            console.log('Mail send : ', sendMail);
        }

        req.session.userData = email
        req.session.userOtp = otp
        req.session.newPassword = newPassword

        return res.redirect('/user/verify-change-pass-otp?message=Enter your OTP.&type=success')

    } catch (error) {
        console.log(error);

    }
}

const loadChangePasswordOtpPage = async (req, res) => {
    try {
        return res.render('change-pass-otp')
    } catch (error) {

    }
}

const verifyChangePass = async (req, res) => {
    try {
        const { otp } = req.body

        if (otp === req.session.userOtp) {

            const email = req.session.userData
            console.log('email : ', email);
            console.log('OTP : ', otp);

            const newPassword = req.session.newPassword
            const hashedPassword = await bcrypt.hash(newPassword, 10)

            await User.updateOne({ email },
                {
                    $set: {
                        password: hashedPassword
                    }
                }
            )

            return res.redirect('/user/change-password?message=Password changed successfully.&type=success')

        } else {
            return res.redirect('/user/verify-change-pass-otp?message=Invalid OTP.&type=error')
        }

    } catch (error) {
        console.log(error)
    }
}

const resendChangePassOtp = async (req, res) => {
    try {
        const email = req.session.userData
        console.log('EMAIL : ', email);

        const otp = generateOtp()
        console.log('OTP : ', otp);

        const sendMail = await sendVerifyMail(email, otp)
        if (!sendMail) {
            console.log('Can not send otp to mail');
            return res.status(500).json({
                success: false,
                message: 'Cannot send OTP to your email. Please try again later.'
            })
        }

        req.session.userOtp = otp

        return res.status(200).json({
            success: true,
            message: 'OTP resend successfully.'
        })


    } catch (error) {
        console.log(error);

    }

}

///// FORGOT PASSWORD

const loadForgotMailPage = async (req, res) => {
    try {
        res.render('forgot-email')
    } catch (error) {
        console.log(error);

    }
}

const verifyForgotMail = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.redirect('/user/forgot-email?message=Email is required.&type=error')
        }
        req.session.userData = email

        const user = await User.findOne({ email })
        if (!user) {
            console.log('User not found');
            return res.redirect('/user/forgot-email?message=Can not found user.&type=error')
        }

        const otp = generateOtp()
        console.log("OTP : ", otp);

        console.log("EMAIL : ", email);

        const sendMail = await sendVerifyMail(email, otp)
        console.log('Send Mail : ', sendMail);
        if (!sendMail) {
            return res.redirect('/user/forgot-email?message=Failed to send OTP. Please try again later.&type=error')

        }

        req.session.userOtp = otp
        req.session.userData = email
        // req.session.otpExiry = Date.now() + 30 * 1000

        console.log('verify forgot mail fucion ended....');


        return res.redirect('/user/verify-forgot-otp?message=Enter your OTP.&type=success')

    } catch (error) {
        console.log(error);

    }
}

const loadForgotOtpPage = async (req, res) => {
    try {
        return res.render('forgot-pass-otp')
    } catch (error) {
        console.log(error);

    }
}

const verifyForgotOtp = async (req, res) => {
    console.log('entered into verify forgot otp page....');

    try {
        console.log('...........');

        const { otp } = req.body
        console.log('Entered OTP:', otp)
        console.log('Session OTP:', req.session.userOtp)
        console.log('Current time:', Date.now())
        console.log('Expiry:', req.session.otpExpiry)

        // const isOtpValid = otp === req.session.userOtp && Date.now() < req.session.otpExiry

        if (otp === req.session.userOtp) {

            // if (isOtpValid) {
            return res.redirect('/user/forgot-reset-pass')
        } else {
            return res.redirect('/user/verify-forgot-otp?message=Invalid OTP.&type=error')
        }
    } catch (error) {
        console.log(error);

    }
}

const resendForgotOtp = async (req, res) => {
    try {

        const email = req.session.userData
        const otp = generateOtp()
        console.log('SESSION EMAIL : ', email);
        console.log(' New OTP : ', otp);

        const sendMail = await sendVerifyMail(email, otp)
        console.log('Sent Mail : ', sendMail);
        if (!sendMail) {
            return res.status(500).json({
                success: false,
                message: 'Can not send OTP to your email. Please try again later.'
            })
        }

        req.session.userOtp = otp

        return res.status(200).json({
            success: true,
            message: 'Enter Your OTP.'
        })

    } catch (error) {
        console.log(error);

    }
}

const loadResetForgotPassPage = async (req, res) => {
    try {
        res.render('forgot-reset-pass')
    } catch (error) {
        console.log(error);

    }
}
const resetForgotPass = async (req, res) => {
    try {
        const { newPassword, confirmPassword } = req.body

        if (!newPassword || !confirmPassword) {
            return res.redirect('/user/forgot-reset-pass?message=Password can not empty.&type=error')
        }

        if (newPassword !== confirmPassword) {
            return res.redirect('/user/forgot-reset-pass?message=Password not match.&type=error')
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10)

        const email = req.session.userData
        const user = await User.findOne({ email })
        if (!user) {
            console.log('User not found');
            return res.redirect('/user/forgot-reset-pass?message=User not found.&type=error')
        }

        await User.updateOne({ email }, { $set: { password: hashedPassword } })

        return res.redirect('/user/dashboard?message=Password updated successfully.&type=success')
    } catch (error) {
        console.log(error);

    }
}
///////LOGOUT
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.redirect('/user/dashboard?message=Some issues to logout. Please try again.&type=error')
        }
        return res.redirect('/user/login?message=You have logged out successfully.&type=error')
    })
}



module.exports = {
    loadPageNotFound,
    loadAboutUsPage,
    loadLoginPage,
    loadSignUpPage,
    signup,
    loadSignupOtpPage,
    verifySignupOtp,
    resendSignupOtp,
    login,
    logout,
    loadChangePasswordPage,
    changePassword,
    loadChangePasswordOtpPage,
    verifyChangePass,
    resendChangePassOtp,
    loadForgotMailPage,
    verifyForgotMail,
    loadForgotOtpPage,
    verifyForgotOtp,
    resendForgotOtp,
    loadResetForgotPassPage,
    resetForgotPass
}