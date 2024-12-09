const express = require("express")
const cloudinary = require("cloudinary")
const router = require("./routes/auth.routes")
const userRoutes = require("./routes/userRoutes")
const cors = require("cors")
const app = express()
const path = require("path")
const dotenv = require('dotenv')
dotenv.config({path:path.join(__dirname,".env")})
cloudinary.config({
    cloud_name : process.env.CLOUDINARY_CloudName,
    api_key : process.env.CLOUDINARY_API_KEY,
    api_secret : process.env.CLOUDINARY_API_SECRET
})

const PORT = process.env.PORT || 1000

const connectDB = require("./DB/connectDB")
const cookieParser = require('cookie-parser')
const postRoutes = require("./routes/postRoutes")
const notificationRoutes = require("./routes/notificationRoutes")

app.use(cors())
app.use(express.urlencoded({
    extended : true
}))
app.use(cookieParser())
app.use(express.json({
    limit : "5mb"
}))
app.use("/api/auth",router)
app.use("/api/user",userRoutes)
app.use("/api/post",postRoutes)
app.use("/api/notification",notificationRoutes)


app.use(express.static(path.join(__dirname,"/client/dist")))
app.use("*",(req,res)=> res.sendFile(__dirname,"/client/dist/index.html"))

app.listen(PORT,()=>{
    console.log("server is running on port number "+PORT)
    connectDB()
})