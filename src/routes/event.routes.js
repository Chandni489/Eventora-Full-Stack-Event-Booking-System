const express=require('express')
const router=express.Router()
const eventController=require('../controllers/event.controller')
const authMiddleware=require('../middlewares/auth.middleware')

router.post('/',authMiddleware.protect,authMiddleware.adminProtect,eventController.createEvent);
router.get('/',eventController.getAllEvents);
router.get('/:id',eventController.getEventById);



router.put('/:id',authMiddleware.protect,authMiddleware.adminProtect,eventController.updateEvent);
router.delete('/:id',authMiddleware.protect,authMiddleware.adminProtect,eventController.deleteEvent);

module.exports=router;