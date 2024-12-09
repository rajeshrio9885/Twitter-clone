const notification = require("../model/noticationModel")
const User = require("../model/user.model")
const bcryptjs = require("bcryptjs")
const cloudinary = require("cloudinary")

const getUser = async(req,res)=>{
    try {
        const {username} = req.params
        const user = await User.findOne({username}).select("-password").populate({path:"following"}).populate({path:"followers"})
        if(!user){
            return res.status(400).json({
                error : "User not found"
            })
        }
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
   
}
const followAndFollowers = async(req,res)=>{ 
    try{ 
        const {id} = req.params;
    const modifiedUser = await User.findOne({_id:id})
    const currentUser = await User.findOne({_id:req.user._id})

    if(currentUser._id == id){
        return res.status(400).json({
            message : "You can't follow or unfollow yourself"
        })
    }

    if(!modifiedUser || !currentUser){
        return res.status(400).json({
            error : "User not found"
        })
    }
    if(currentUser.following.includes(id)){
        await User.findByIdAndUpdate({_id:req.user.id},{$pull:{following:id}})
        await User.findByIdAndUpdate({_id:id},{$pull:{followers:req.user.id}})
        return  res.status(200).json({
            message : "unfollowed successfully"
        })
    }else{
        await User.findByIdAndUpdate({_id:req.user.id},{$push:{following:id}})
        await User.findByIdAndUpdate({_id:id},{$push:{followers:req.user.id}})
        //notification
        const newNotification = await notification({
            type : "follow",
            from : req.user.id,
            to: id
        })
        await newNotification.save()
        return  res.status(200).json({
            message : "followed successfully"
        })
    }
    }catch(error){
        console.log("error",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
    
}
const suggested = async(req,res)=>{
    try {
        const userId = req.user._id
        const followinguser = await User.findOne({_id:userId}).select("-password")
        const suggestedFollower = await User.aggregate([
            {
                $match :{
                    _id : {$ne : userId}
                }
            },
            {
                $sample :{
                    size : 10
                }
            }
        ])
        const filterUser = suggestedFollower.filter((user)=> !followinguser.following.includes(user._id))
        const suggestUser = filterUser.slice(0,5)
        suggestUser.forEach((user)=> user.password = null)
        res.status(200).json({
            suggestUser
        })
    } catch (error) {
        console.log("error",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}
const profileUpdate = async(req,res)=>{
    try {
        let userId = req.user._id
        let user = await User.findById({_id:userId})
        let {username,fullName,email,currentPassword,newPassword,bio,link} = req.body
        let {profileImg,coverImg} = req.body
        if((!currentPassword && newPassword) || (currentPassword && !newPassword)){
            return res.status(400).json({
                error : "You should give both current password and newpassword to change"
            })
        }
        if(currentPassword && newPassword){
            if(newPassword.length < 6){
                return res.status(400).json({
                    error : "New password must be greater than 6 characters"
                })
            }
            const isPassword = await bcryptjs.compare(currentPassword,user.password)
            if(!isPassword){
                return res.status(400).json({
                    error : "You have entered wrong password"
                })
            }
            const salt = await bcryptjs.genSalt(10)
            user.password = await bcryptjs.hash(newPassword,salt)
        }
        if(profileImg){
            if(user.profileImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split('.')[0])
            }
            const uploaded = await cloudinary.uploader.upload(profileImg)
            profileImg = uploaded.secure_url;
        }
        if(coverImg){
            if(user.coverImg){
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split('.')[0])
            }
            const uploaded = await cloudinary.uploader.upload(coverImg)
            coverImg = uploaded.secure_url;
        }
        const isemail = await User.findOne({email})
        const isUser = await User.findOne({username})
        if(isemail){
            return res.status(400).json({
                error : "email already exist"
            })
        }
        if(isUser){
            return res.status(400).json({
                error : "user already exist"
            })
        }
        user.email = email || user.email
        user.username = username || user.username
        user.fullName = fullName || user.fullName;
        user.username = username || user.username;
        user.coverImg = coverImg || user.coverImg;
        user.profileImg = profileImg || user.profileImg;
        user.link = link || user.link;
        user.bio = bio || user.bio;
        
        user = await user.save();
        user.password = null ;
        return res.status(200).json({
                message : "updated successfully",
                user
            })
    } catch (error) {
        console.log("error",error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
}

module.exports = {getUser,followAndFollowers,suggested,profileUpdate}