const eventModel=require('../models/event.model')
async function createEvent(req,res){
  const {title,description,date,location,category,ticketPrice,totalSeat,imageUrl}=req.body
  try{
    
    const event=await eventModel.create({
      title,description,date,location,category,ticketPrice,totalSeat,imageUrl, createdBy: req.user._id,availableSeats:totalSeat
    })
    res.status(201).json(event)
  }catch(err){
    res.status(500).json({err:err.message})
  }
}
async function getAllEvents(req,res){
  try{
    const filters={};
     if (req.query.category?.trim()) {
      filters.category = {
        $regex: req.query.category.trim(),
        $options: "i"
      };
    }
    if (req.query.location?.trim()) {
      filters.location = {
        $regex: req.query.location.trim(),
        $options: "i"
      };
    }
    const events=await eventModel.find(filters);
    res.json(events)
  }catch(err){
    console.log("error while fetching",err);
    
    res.status(500).json({
      error:err.message
    })
  }
}
async function getEventById(req,res){
  try{
  const event = await eventModel.findById(req.params.id)
  if(!event){
    return res.status(404).json({
      error:'Event not found'
    })
  }
  res.json(event)
  }catch(err){
      res.status(500).json({
      error:err.message
    })
  }
  
}

async function updateEvent(req,res){
  const {title,description,date,location,category,ticketPrice,totalSeat,availableSeats,imageUrl}=req.body
  try{
    const event=await eventModel.findByIdAndUpdate(req.params.id,{
      title,description,date,location,category,ticketPrice,totalSeat,availableSeats,imageUrl
    },{new:true})
    if(!event){
      return res.status(404).json({err:"Event not found"})
    }
    res.json(event)
  }catch(err){
    res.status(500).json({err:err.message})
  }
}
async function deleteEvent(req,res){
  
  try{
    const event=await eventModel.findByIdAndDelete(req.params.id)
    if(!event){
      return res.status(404).json({err:"Event not found"})
    }
    res.json({message:"Event deleted succesfully"})
  }catch(err){
    res.status(500).json({err:err.message})
  }
}
module.exports={
  createEvent,getAllEvents,getEventById,updateEvent,deleteEvent
}