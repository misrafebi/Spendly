const express=require('express')
const router=express.Router()
const userConteroller=require('../Controllers/user/userController')
const dashboardController=require('../Controllers/user/dashboardController')
const categoryController=require('../Controllers/user/categoryController')
const transactionController=require('../Controllers/user/transactionController')

router.get('/dashboard',dashboardController.loadDashBoard)
router.get('/page-not-found',userConteroller.loadPageNotFound)
router.get('/about-us',userConteroller.loadAboutUsPage)
router.get('/login',userConteroller.loadLoginPage)

router.get('/signup',userConteroller.loadSignUpPage)
router.post('/signup',userConteroller.signup)
router.get('/verify-otp',userConteroller.loadOtpPage)
router.post('/verify-otp',userConteroller.verifyOtp)
router.post('/resend-otp',userConteroller.resendOtp)

router.get('/change-password',userConteroller.loadChangePasswordPage)
router.get('/category',categoryController.laodCategoryPage)
router.get('/transaction',transactionController.loadTransactionPage)

module.exports=router