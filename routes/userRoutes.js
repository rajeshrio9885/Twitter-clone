const express = require("express")
const {getUser,followAndFollowers,suggested,profileUpdate} = require("../controllers/userController")
const protectRoute = require("../utils/protectRoutes")
const userRoutes = express.Router()


userRoutes.get("/getuser/:username",protectRoute,getUser)
userRoutes.get("/suggested",protectRoute,suggested)
userRoutes.post("/profileupdate",protectRoute,profileUpdate)
userRoutes.post("/follow/:id",protectRoute,followAndFollowers)

 

module.exports = userRoutes