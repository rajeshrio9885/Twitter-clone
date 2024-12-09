const User = require("../model/user.model")
const Notification = require("../model/noticationModel")
const getNotification = async(req,res)=>{
    try {
        const id = req.user._id
        const user = await User.findOne({_id:id})
        if(!user){
            return res.status(404).json({
                error : "Error not found"
            })
        }
        let notification = await Notification.find({to:id}).populate({path:"from",select:"username profileImg fullName bluetick"}).sort({createdAt : -1})

        await Notification.updateMany({to:id},{read : true})
        notification = notification.filter((not)=> not.from._id.toString() !== not.to.toString())
        res.status(200).json(notification)
    } catch (error) {
        console.log("error in getnotification ",error)
        return res.status(500).json({
            error : "Internal server error"
        })
    }   

}

const deleteNotification = async(req,res)=>{
    try {
        const user = req.user._id
        await Notification.deleteMany({to:user})
        res.status(200).json({
            message : 'notification deleted'
        })
    } catch (error) {
        console.log("error in deletenotification ",error)
        return res.status(500).json({
            error : "Internal server error"
        })
    }
}


module.exports = {getNotification,deleteNotification}