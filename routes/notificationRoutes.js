const express = require("express")
const protectRoute = require("../utils/protectRoutes")
const { getNotification,deleteNotification } = require("../controllers/notificationController")
const notificationRoutes = express.Router()

notificationRoutes.get("/",protectRoute,getNotification)
notificationRoutes.delete("/",protectRoute,deleteNotification)

module.exports = notificationRoutes