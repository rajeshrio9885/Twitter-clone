const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    username : {
        type : String,
        required : true,
        unquie:true

    },
    fullName :{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true,
        unquie:true
    },
    password:{
        type : String,
        required : true,
        minLength: 6
    },
    followers:[
        {
            type : mongoose.Types.ObjectId,
            ref:"User",
            default:[]
        }
    ],
    following : 
        [
            {
                type : mongoose.Types.ObjectId,
                ref:"User",
                default:[]
            }
        ],
    profileImg:{
        type : String,
        default : ""
    },
    coverImg :{
        type : String,
        default : ""
    },
    bio:{
        type : String,
        default : ""
    },
    link:{
        type : String,
        default : ""
    },
    likedpost:[
        {
            type : mongoose.Types.ObjectId,
            ref :"Post",
            default : []
        }
    ],
    bluetick : {
        type : Boolean,
        default : false
    }
},{timestamps : true})

const User = mongoose.model("User",userSchema)
module.exports = User