const mongoose = require('mongoose')

const notificationModel = new mongoose.Schema({
    from:{
        type : mongoose.Types.ObjectId,
        require:true,
        ref : "User"
    },
    to:{
        type : mongoose.Types.ObjectId,
        require:true,
        ref : "User"
    },
    type:{
        type : String,
        enum : ["like","follow","comment"],
        require:true
    },
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true})

const notification = mongoose.model('notification',notificationModel)

module.exports = notification