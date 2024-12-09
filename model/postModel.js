const mongoose = require("mongoose")

const PostSchema = new mongoose.Schema({
    user:{
        type : mongoose.Types.ObjectId,
        ref : "User",
        require : true
    },
    img:{
        type : String
    },
    text:{
        type : String
    },
    like:[
        {
        type : mongoose.Types.ObjectId,
        ref : "User"
        }
    ],
    comment:[
        {
            user : {
                type : mongoose.Types.ObjectId,
                ref : "User",
                require : true
            },
            text : {
                type : String,
                require : true
            }
        }
    ]
},{timestamps:true})

const Post = mongoose.model('Post',PostSchema)

module.exports = Post