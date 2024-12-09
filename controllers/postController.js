const cloudinary = require("cloudinary");
const Post = require("../model/postModel");
const User = require("../model/user.model");
const notification = require("../model/noticationModel");
 

const createPost = async(req,res)=>{
    try {
        const {text} = req.body;
        let {img} = req.body;
        const userId = req.user._id.toString()
        const user = await User.findOne({_id:userId})
        if(!user){
            return res.status(400).json({
                error : "User not found"
            })
        }
        if(!text && !img){
            return res.status(400).json({
                error : "post must have img or text"
            })
        }
        if(img){
            const upload = await cloudinary.uploader.upload(img)
            img = upload.secure_url
        }
        const newPost = await new Post({
            user : userId,
            text,
            img
        })
        const post = await newPost.save()
        res.status(201).json(post)

    } catch (error) {
        console.log("error in createPost ",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}
const deletePost = async(req,res)=>{
    try {
        const {id} = req.params
        const post = await Post.findById({_id:id})
        if(!post){
            return res.status(404).json({
                error : "Post not found"
            })
        }
        if(post.user.toString() !== req.user._id.toString()){
            return res.status(401).json({
                error : "You are not authorise to delete the post"
            })
        }
        if(post.img){
            const imgId = post.img.split('/').pop().split('.')[0]
            await cloudinary.uploader.destroy(imgId)
        }
        await Post.findByIdAndDelete({_id:id})
        res.status(200).json({
            message : "Post deleted successfully"
        })
    } catch (error) {
        console.log("error in createPost ",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
    
}
const createComment = async(req,res)=>{
    try {
        const {text} = req.body
        const {id} = req.params
        const userId = req.user._id
        if(!text){
            return res.status(400).json({
                error : "text is need for comment"
            })
        }
        const post = await Post.findById({_id:id})
        if(!post){
            return res.status(400).json({
                error : "Post not found"
            })
        }
        const updatePost = {
            user : userId,
            text
        }
        post.comment.push(updatePost)
        await post.save()
        //notification
        const commentNotification = await new notification({
            type : "comment",
            from : userId,
            to : post.user
        })
        await commentNotification.save()
        const comment =  await post.populate({path:"comment.user",select:"-password"})
        res.status(201).json(comment)



    } catch (error) {
        console.log("error in createComment ",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}
const likeUnlike = async(req,res)=>{
    try {
        const userId = req.user._id.toString()
        const {id : postId} = req.params;
        const post = await Post.findOne({_id:postId})
        const user = await User.findById({_id:userId})
        if(!user){
            return res.status(404).json({
                error : "user not found"
            })
        }
        if(!post){
            return res.status(404).json({
                error : "Post not found"
            })
        }
        if(post.like.includes(userId)){
            //unlike
            post.like.pull(userId)
            await User.findByIdAndUpdate({_id:userId},{$pull:{likedpost : postId}})
            await post.save()
            const updateLikes = post.like.filter((id)=> id.toString() !== userId.toString())
            res.status(200).json(updateLikes)

        }else{
            post.like.push(userId)
            await User.findByIdAndUpdate({_id:userId},{$push:{likedpost : postId}})
            await post.save()
            //notification 
            await new notification({
                type : "like",
                from : userId,
                to : post.user
            }).save()
            const updateLikes = post.like
            res.status(200).json(updateLikes)
            
        }

    } catch (error) {
        console.log("error in likeUnlike ",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}
const getAllPost = async(req,res)=>{
    try {
        const userId = req.user._id;
        const user = await User.findById({_id:userId})
        if(!user){
            return res.status(400).json({
                error : "User not found"
            })
        }
        let allPost = await Post.find({}).sort({createdAt : -1}).populate({path : "user",select:"-password"}).populate({path : "comment.user",select:['-password','-email','-following','-followers','-bio','-link']})
        if(allPost.length == 0){
            allPost = []
            return res.status(200).json(allPost)
        }
        res.status(200).json(
            allPost
        )
    } catch (error) {
        console.log("Error in getAllPost ",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}
const getliked = async(req,res)=>{
  try {
    const {id} = req.params;
    const user = await User.findById({_id:id})
    if(!user){
        return res.status(404).json({
            error : "User not found"
        })
    }
    const likedPost = await Post.find({_id : {$in : user.likedpost}})
    .populate({
        path : "user",
        select : ['-password']
    })
    .populate({
        path : "comment.user",
        select : ['-password','-email','-following','-followers','-bio','-link']
    })
    res.status(200).json(likedPost)
  } catch (error) {
    res.status(500).json({
        error : "Internal server error"
    })
    console.log("error in getliked ",error)
  }
}
const followedPost = async(req,res)=>{
    try {
        const id = req.user._id;
        const user = await User.findById({_id:id})
        if(!user){
            return res.status(404).json({
                error : "User not found"
            })
        }
        let allPost = await Post.find({ user:{$in : user.following}})
        .sort({createdAt : -1})
        .populate({
            path : "user",
            select : '-password'
        })
        .populate({
            path : "comment.user",
            select : ['-password','-email','-following','-followers','-bio','-link']
        })
        if(allPost.length == 0){
            return res.status(200).json(
                allPost = []
            )
        }
        res.status(200).json(allPost)
    } catch (error) {
        console.log("error in followedPost ",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}
const getuserpost = async(req,res)=>{
    try {
        const {username} = req.params
        const isuser = await User.findOne({username})
        const userPost = await Post.find({user : isuser?._id}).sort({createdAt : -1})
        .populate({path:"user",select : "-password"}).populate({path:"comment.user",select :"-password"})
        if(!isuser){
            return res.status(404).json({
                error : "User not found"
            })
        }
        if(userPost.length == 0){
            return res.status(200).json([])
        }
        res.status(200).json(userPost)
    } catch (error) {
        console.log("error in userpost ",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}
module.exports = {createPost,deletePost,createComment,likeUnlike,getAllPost,getliked,followedPost,getuserpost}