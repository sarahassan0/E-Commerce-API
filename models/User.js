var mongoose = require('mongoose')
var bcrypt = require('bcrypt')

// Define User Schema
const userSchema = mongoose.Schema({
    username: {
        type: String,
        minLength: 5,
        unique: true,
        required: true,
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
    orders: [{ type: mongoose.Schema.ObjectId, ref: "Order" }]
},
    { timestamps: true }
)
//hashing password before send it to DB
userSchema.pre("save", function (next) {

    // this step could be implemented in the route
    const salt = bcrypt.genSaltSync(15);
    const hashedPass = bcrypt.hashSync(this.password, salt);
    this.password = hashedPass
    next()
})

userSchema.pre("update", function (next) {

    // this step could be implemented in the route
    const salt = bcrypt.genSaltSync(15);
    const hashedPass = bcrypt.hashSync(this.password, salt);
    this.password = hashedPass
    next()
})


// Create User Collection 
const userModel = mongoose.model("User", userSchema)





module.exports = userModel