const User = require("../model/user.model");
const bcryptjs = require('bcryptjs');
const generateToken = require("../utils/generateToken");

 const signup = async(req,res)=>{
    try {
        const {username,fullName,email,password} = req.body;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({
                error:"Invalid email format"
            })
        }
        const existEmail = await User.findOne({email})
        const existUser = await User.findOne({username})
        if(existEmail || existUser){
            return res.status(400).json({
                error : "User already exist"
            })
        }
        if(password.length < 6){
            return res.status(400).json({
                error : "password must have atleast 6 char length"
            })
        }
        if(!fullName){
            return res.status(400).json({
                error : "Enter fullName"
            })
        }
        //hasing password
        const salt = await bcryptjs.genSalt(10);
        const hashedpassword = await bcryptjs.hash(password,salt)

        const newUser = new User({username,fullName,email,password:hashedpassword})
        if(newUser){
            generateToken(newUser._id,res)
            await newUser.save()
            res.status(200).json({
              message : "user created successfully!"
            })
        }else{
            res.status(400).json({
                error:"invalid user data"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "Internal error"
        })
    }
}
const login =async(req,res)=>{
   try {
    const {username,password} = req.body;
    const user = await User.findOne({username})
    const isPassword = await bcryptjs.compare(password,user?.password || "")
    if(!user || !isPassword){
        return res.status(400).json({
            error : "user invalid or password"
        })
    }
    generateToken(user._id,res)
    res.status(200).json({
        __id : user._id,
        username : user.username,
        fullName : user.fullName,
        email : user.email,
        followers:user.followers,
        following:user.following,
        profileImg : user.profileImg,
        coverImg : user.coverImg,
        bio : user.bio,
        link : user.link
    })
   } catch (error) {
    console.log("error in login "+error)
    return res.status(500).json({
        error : "Internal server error"
    })
   }
}
const logout =async(req,res)=>{
    try {
      res.cookie('jwt','',{maxAge : 0})
      res.status(200).json({
        message : "Logout successfully"
      })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error : "Internal server error"
        })
    }
}
const getMe = async(req,res)=>{
    try {
        const user = await User.findOne({_id:req.user._id}).select("-password")
        if(!user){
            return res.status(400).json({
                error : "User not found"
            })
        }
        res.status(200).json(
            user
        )
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            error : "Internal server error"
        })
    }
    
}

module.exports = {signup,login,logout,getMe}