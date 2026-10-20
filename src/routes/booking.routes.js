const express=require('express')
const router=express.Router()
const bookingController=require('../controllers/booking.controller')
const authMiddleware=require('../middlewares/auth.middleware')

router.post('/',authMiddleware.protect,bookingController.bookEvent)

router.post('/send-otp',authMiddleware.protect,bookingController.sendBookingOTP)



router.get('/my',authMiddleware.protect,bookingController.getMyBooking)

router.put('/:id/confirm',authMiddleware.protect,authMiddleware.adminProtect,bookingController.confirmBooking)

router.delete('/:id',authMiddleware.protect,bookingController.cancelBooking)



module.exports=router