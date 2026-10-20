const express=require('express')
const router=express.Router()
const authController=require('../controllers/auth.controller');

router.post('/register',authController.authRegister)
router.post('/login',authController.authLogin)
router.post('/verify-otp',authController.verifyOTP)
module.exports=router