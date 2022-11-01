var mongoose = require('mongoose')
var bcrypt = require('bcrypt')


const sellerSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minLength: 5,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        minLength: 5,
        required: true,
        trim: true
    },
    password: {
        type: String,
        minLength: 4,
        required: true,
        trim: true
    },
    products: [{ type: mongoose.Schema.ObjectId, ref: "Product" }]
},
    { timestamps: true }
)

sellerSchema.pre("save", function (next) {
    // this step could be implemented in the route
    const salt = bcrypt.genSaltSync(10);
    const hashedPass = bcrypt.hashSync(this.password, salt);
    this.password = hashedPass
    next()
})

const sellerModel = mongoose.model("Seller", sellerSchema)


module.exports = sellerModel