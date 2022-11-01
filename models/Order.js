var mongoose = require('mongoose')


const orderSchema = new mongoose.Schema({
    userID: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: true
    },
    products: [{
        productID: { type: mongoose.Schema.ObjectId, ref: "Product", required: true },
        quantity: {
            type: Number,
            default: 1,
        }
    }],
    status: {
        type: String,
        default: "pending",
        enum: ['pending', 'ready', 'closed']
    }
},
    { timestamps: true }
)

const orderModel = mongoose.model("Order", orderSchema)


module.exports = orderModel