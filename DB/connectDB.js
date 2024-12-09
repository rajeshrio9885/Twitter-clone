const mongoose = require('mongoose')

const connectDB = async()=>{
  await mongoose.connect(process.env.MongoDB_URI).then((con)=>{
        console.log("Database connected successfully "+con.connection.host)
    }).catch((err)=>console.log("db",err))
}

module.exports = connectDB