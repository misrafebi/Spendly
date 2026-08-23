const express = require('express')
const router = express.Router()
const userConteroller = require('../Controllers/user/userController')
const dashboardController = require('../Controllers/user/dashboardController')
const categoryController = require('../Controllers/user/categoryController')
const transactionController = require('../Controllers/user/transactionController')
const auth = require('../middlewares/userAuth')

router.get('/dashboard', auth.noCache, auth.isLogin, dashboardController.loadDashBoard)
router.get('/page-not-found', userConteroller.loadPageNotFound)
router.get('/about-us', auth.noCache, auth.isLogin, userConteroller.loadAboutUsPage)

router.get('/login', auth.noCache, auth.isLogout, userConteroller.loadLoginPage,)
router.post('/login', auth.noCache, auth.isLogout, userConteroller.login)

router.get('/signup',auth.noCache, auth.isLogout,userConteroller.loadSignUpPage)
router.post('/signup',auth.noCache, auth.isLogout,userConteroller.signup)
router.get('/verify-signup-otp',userConteroller.loadSignupOtpPage)
router.post('/verify-signup-otp',userConteroller.verifySignupOtp)
router.post('/resend-signup-otp',userConteroller.resendSignupOtp)

router.get('/change-password',auth.noCache,auth.isLogin,userConteroller.loadChangePasswordPage)
router.post('/change-password',auth.noCache,auth.isLogin,userConteroller.changePassword)
router.get('/verify-change-pass-otp',userConteroller.loadChangePasswordOtpPage)
router.post('/verify-change-pass-otp',userConteroller.verifyChangePass)
router.post('/resend-change-pass-otp',userConteroller.resendChangePassOtp)

router.get('/forgot-email',userConteroller.loadForgotMailPage)
router.post('/forgot-email',userConteroller.verifyForgotMail)
router.get('/verify-forgot-otp',userConteroller.loadForgotOtpPage)
router.post('/verify-forgot-otp',userConteroller.verifyForgotOtp)
router.post('/resend-forgot-otp',userConteroller.resendForgotOtp)
router.get('/forgot-reset-pass',userConteroller.loadResetForgotPassPage)
router.post('/forgot-reset-pass',userConteroller.resetForgotPass)

router.get('/category', auth.noCache, auth.isLogin, categoryController.laodCategoryPage)
router.get('/transaction', auth.noCache, auth.isLogin, transactionController.loadTransactionPage)

router.get('/logout',auth.noCache,auth.isLogin,userConteroller.logout)

module.exports = router