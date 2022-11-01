const express = require("express");
const userModel = require("../models/User");
const productModel = require("../models/Product");
const userAuth = require('../middlewares/userAuth')
const orderModel = require("../models/Order");

const router = express.Router()


// Handling clint requests
//add new Order 
router.post('/', userAuth, async (req, res, next) => {
    let newOrder = req.body
    let prods = newOrder.products
    try {
        let user = await userModel.findById(req.userID)
        if (user) {
            let validProds = []
            for (let prod of prods) {
                const product = await productModel.findById(prod.productID)
                if (product && product.productAmount > 0) {
                    if (product.productAmount >= prod.quantity) {
                        validProds.push(prod)
                    }
                }
            }
            newOrder.userID = req.userID
            newOrder.products = validProds
            order = await orderModel.create(newOrder)
            await userModel.findByIdAndUpdate(req.userID, { $push: { "orders": order.id } }, { runValidators: true })
            res.status(201).json(order)
        } else res.status(401).json(`Invalid User ID. This User cannot create Order`)
    } catch (err) {
        res.status(400).json(`Unable to add new Order. Error: ${err}`)
    }
})




// get all Orders
router.get('/', async (req, res, next) => {
    try {
        let orders = await orderModel.find()
        if (orders) {
            res.status(200).json(orders)
        } else res.status(404).json(`No Orders founded`)
    } catch (err) {
        res.status(400).json(`Cannot get Orders. Error: ${err}`)
    }
})



// get Order by its ID
router.get('/:id', userAuth, async (req, res, next) => {
    const _id = req.params.id
    try {
        let order = await orderModel.findById(_id).populate('products')
        if (order) {
            if (order.userID == req.userID) {
                res.status(200).json(order)
            } else res.status(401).json('Unauthorized User Cannot get this Order')
        } else res.status(404).json('`Invalid Order ID`')
    } catch (err) {
        res.status(400).json(`Cannot get Order with ID ${_id}. Error: ${err}`)
    }
})


// Update Order by its ID
router.patch('/:id', userAuth, async (req, res, next) => {
    const _id = req.params.id
    updatedOrder = req.body
    try {

        var order = await orderModel.findById(_id)
        if (order) {
            if (order.userID.id == req.userID) {
                await orderModel.findByIdAndUpdate(_id, updatedOrder, { runValidators: true })
                res.status(204).json(`this Order has been updated`)
            } else res.status(401).json('Unauthorized User Cannot edit this Order')
        } else {
            res.status(404).json(`Invalid Order ID`)
        }
    } catch (err) {
        res.status(400).json(`Cannot update Order with ID ${_id}. Error: ${err}`)
    }
})



// Delete Product by its ID
router.delete('/:id', userAuth, async (req, res, next) => {
    const _id = req.params.id
    try {
        let order = await orderModel.findById(_id)
        if (order) {
            if (order.userID == req.userID) {
                order = await orderModel.findByIdAndRemove(_id)
                res.status(200).json(`Order with ID ${_id} has been deleted`)
            } else res.status(401).json('Unauthorized User Cannot delete this Order')
        } else {
            res.status(404).json(`Invalid Order ID`)
        }
    } catch (err) {
        res.status(400).json(`Cannot delete Order with ID ${_id}. Error: ${err}`)
    }
})







module.exports = router