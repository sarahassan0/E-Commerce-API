const express = require("express");
const cors = require('cors');
var mongoose = require('mongoose')
var sellerRouter = require('./routes/seller');
var productRouter = require('./routes/product');
var userRouter = require('./routes/user');
var orderRouter = require('./routes/order');
const dotenv = require('dotenv');
dotenv.config();

// Init the server
const app = express()
app.use(express.json())
app.use(cors())

// Connecting to local DB 
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@e-commerce-api.rjf05ji.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log("Database Connected");
}).catch((err) => {
    throw new Error(err);
});


// main root
app.get('/', (req, res, next) => {
    res.status(200).json('Welcome to E-Commerce API')
})

//API's
app.use('/sellers', sellerRouter)
app.use('/products', productRouter)
app.use('/users', userRouter)
app.use('/orders', orderRouter)


app.use("*", function (req, res, next) {
    res.status(404).json("Not Found")

})

module.exports = app