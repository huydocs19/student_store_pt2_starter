const express = require("express")
const Order = require("../models/order")
const {requireAuthenticatedUser} = require("../middleware/security")
const router = express.Router()

router.get("/", requireAuthenticatedUser, async (req, res, next) => {
  try {
    const {user} = res.locals
    const orders = await Order.listOrdersForUser(user)
    return res.status(200).json({ orders })
  } catch (err) {
    next(err)
  }
})
router.post("/", requireAuthenticatedUser, async (req, res, next) => {
    try {
      const {user} = res.locals
      const order = await Order.createOrder(user, req.body)
      return res.status(201).json({ order })
    } catch (err) {
      next(err)
    }
  })

module.exports = router