const jwt = require('jsonwebtoken');
const User = require('../model/user.model');
const protectRoute = async(req,res,next)=>{
    try {
        const token = req.cookies.jwt;

        if(!token){
            return res.status(400).json({
                error : "No authorised token"
            })
        }
    
        const decode = jwt.verify(token,process.env.JWT_SECRET)
        if(!decode){
            return res.status(400).json({
                error : "protect User not found"
            })
        }
        const user = await User.findOne({_id:decode.userId})
        req.user = user;
        next()
    } catch (error) {
        console.log(error)
        res.status(500).json({
            error : "Internal server error"
        })
    }
   
}

module.exports = protectRoute
