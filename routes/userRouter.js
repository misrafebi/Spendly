const express=require('express')
const router=express.Router()
const userConteroller=require('../Controllers/user/userController')

router.get('/',userConteroller.loadDashBoard)
router.get('/page-not-found',userConteroller.loadPageNotFound)

module.exports=router