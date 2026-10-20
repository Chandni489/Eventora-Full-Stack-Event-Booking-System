const bookingModel=require('../models/booking.model')
const otpModel=require('../models/otp.model')
const eventModel=require('../models/event.model')
const { sendBookingEmail, sendOTPEmail } = require('../utils/email.utils')

const generateOtp=()=>Math.floor(100000+Math.random()*900000).toString();

async function sendBookingOTP(req,res){
  try{
    const otp=generateOtp()
    await otpModel.findOneAndDelete({email:req.user.email,action:'event_booking'})
    await otpModel.create({email:req.user.email,otp:otp,action:'event_booking'})
    await sendOTPEmail(req.user.email,otp,'event_booking')
    res.json({
      message:"OTP sent to email"
    })
  } catch(err){
    res.status(500).json({
      message:'Error sending OTP',
      err:err.message
    })
  }
}

async function bookEvent(req,res){
  const {eventId,otp}=req.body;
  const otpRecord=await otpModel.findOne({email:req.user.email,otp,action:'event_booking'})
    if(!otpRecord){
      return res.status(400).json({error:'Invalid or expired Otp'})
    }
    const event=await eventModel.findById(eventId);
    if(!event){
      return res.status(404).json({error:'Event not found'})
    }
    if(event.availableSeats <=0){
      return res.status(404).json({error:'No seats available'})
    }
    const existingBooking=await bookingModel.findOne({userId:req.user._id,eventId:event._id})
    if(existingBooking){
      return res.status(404).json({error:'You have already booked exists'})
    }
    const booking=await bookingModel.create({
      userId:req.user._id,
      eventId,
      status:'pending',
      paymentStatus:'not_paid',
      amount:event.ticketPrice
    })
    await otpModel.deleteMany({email:req.user.email,action:'event_booking'})
    res.status(201).json({message:'Booking created.Please check your email to verify'})
}

async function confirmBooking(req,res){
  try{
  const paymentStatus=req.body.paymentStatus
  if(!['paid','not_paid'].includes(paymentStatus)){
    res.status(201).json({
      error:"Ivalid payment status"
    })
  }
  const booking=await bookingModel.findById(req.params.id).populate('eventId')
  if(!booking){
    res.status(201).json({
      error:"Booking not found"
    })
  }
  if(booking.status ==='confirmed'){
     res.status(400).json({
      error:"Booking already confirmed"
    })
  }
   const event = await eventModel.findById(booking.eventId._id);
        if (event.availableSeats <= 0) {
            return res.status(400).json({ message: 'No seats available to confirm this booking' });
        }
        if(paymentStatus){
          booking.paymentStatus=paymentStatus
        }
        booking.status = 'confirmed';
        await booking.save()
        event.availableSeats-=1
         await event.save()
           await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
}

async function getMyBooking(req,res) {
 try {
        const bookings = await bookingModel
            .find({ userId: req.user._id })
            .populate('eventId');

        res.json(bookings);
    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
  }
async function cancelBooking(req,res){
  const booking=await bookingModel.findById(req.params.id)
  if(!booking){
     return res.status(400).json({
      error:"Booking not found"
    })
  }
  if(booking.userId.toString() !==req.user._id.toString()){
     return res.status(400).json({
      error:"unauthorised"
    })
  }
  if(booking.status==='confirmed'){
    const event=await eventModel.findById(booking.eventId._id)
    event.totalSeat+=1
    await event.save()
  }
  booking.status==='cancelled'
  await booking.save()
  await booking.deleteOne()
  res.json({message:"booking cancelled"})
}
module.exports={
  cancelBooking,bookEvent,getMyBooking,sendBookingOTP,confirmBooking
}
