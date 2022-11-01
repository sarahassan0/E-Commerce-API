var mongoose = require('mongoose')


const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minLength: 3,
        trim: true
    },
    desc: {
        type: String,
        minLength: 5,
        required: true,
    },
    img: [{ type: String }],

    price: {
        type: Number,
        required: true,
        trim: true
    },
    size: {
        type: [String],
        required: true,
        default: 'small',
        enum: ['XS', 'small', 'medium', 'large', 'Xl']
    },
    category: {
        type: Array,
        trim: true
    },
    productAmount: {
        type: Number,
        default: 1
    },
    sellerID: {
        type: mongoose.Schema.ObjectId,
        ref: "Seller",
        required: true,
    },
},
    { timestamps: true }
)

const productModel = mongoose.model("Product", productSchema)


module.exports = productModel