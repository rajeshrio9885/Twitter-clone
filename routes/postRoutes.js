const express = require("express")
const protectRoute = require("../utils/protectRoutes")
const {createPost,deletePost,createComment,likeUnlike,getAllPost,getliked,followedPost,getuserpost} = require("../controllers/postController")
const postRoutes = express.Router()
 

postRoutes.post("/create",protectRoute , createPost)
postRoutes.post("/like/:id",protectRoute,likeUnlike)
postRoutes.post("/comment/:id",protectRoute,createComment)
postRoutes.delete("/:id",protectRoute,deletePost)
postRoutes.get('/getPost',protectRoute,getAllPost)
postRoutes.get("/getliked/:id",protectRoute,getliked)
postRoutes.get('/getfollowedpost',protectRoute,followedPost)
postRoutes.get("/userpost/:username",protectRoute,getuserpost)
module.exports = postRoutes