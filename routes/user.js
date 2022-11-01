const express = require("express");
var bcrypt = require("bcrypt");
const userModel = require("../models/User");
const orderModel = require("../models/Order");
var jwt = require("jsonwebtoken")
const userAuth = require('../middlewares/userAuth')
require('dotenv').config();



const router = express.Router();



// Handling clint requests
//register new User
router.post("/", async (req, res, next) => {
    let newUser = req.body;
    try {
        let user = await userModel.create(newUser);
        var token = jwt.sign({
            data: { userID: user.id, userUsername: user.username }
        }, process.env.JWT_SECRET, { expiresIn: '29 days' });
        res.status(201).json({ user, token })
    } catch (err) {
        res.status(400).json(`Unable to create User account . Error: ${err}`);
    }

});



// login User
router.post("/login", async function (req, res, next) {
    const { username, password } = req.body;
    try {
        var user = await userModel.findOne({ username: username }).exec()
        if (user) {
            var validpass = bcrypt.compareSync(password, user.password);
            if (validpass) {
                var token = jwt.sign({
                    data: { userID: user.id, userUsername: user.username }
                }, process.env.JWT_SECRET, { expiresIn: '29 days' });
                res.status(200).json({ user, token })
            } else {
                res.status(203).json("Cannot login. Incorrect username or password , try again")
            }
        } else {
            res.status(203).json("Cannot login. Incorrect username or password , try again");
        }
    } catch (err) {
        res.status(400).json(`Unable to add new User. Error: ${err}`)

    }
});



// get User by its ID
router.get("/:id", userAuth, async (req, res, next) => {
    const _id = req.params.id;
    try {
        let user = await userModel.findById(_id)   //.populate('orders');
        if (user && user.id == req.userID) {
            // user = await sellerModel.findById(_id).populate('products');
            res.status(200).json(user);
        } else res.status(401).json('Unauthorized User')
    } catch (err) {
        res.status(420).json(`Cannot get User with ID ${_id}. Error: ${err}`);
    }
});


// Update User by its ID
router.patch("/:id", userAuth, async (req, res, next) => {
    const _id = req.params.id;
    let updatedUser = req.body;
    let password = req.body.password
    try {
        user = await userModel.findById(_id);
        if (user) {
            if (user.id == req.userID) {
                if (password) {
                    const salt = bcrypt.genSaltSync(15);
                    const hashedPass = bcrypt.hashSync(password, salt);
                    updatedUser.password = hashedPass
                    await userModel.findByIdAndUpdate(_id, updatedUser, {
                        runValidators: true,
                    });
                    res.status(200).json(`this User has been updated , also password updated`);
                } else {
                    await userModel.findByIdAndUpdate(_id, updatedUser, {
                        runValidators: true,
                    });
                    res.status(200).json(`this User has been updated `);
                }
            } else res.status(401).json('Unauthorized User cannot edit User info')
        } else {
            res.status(203).json(`Please enter valid User ID`);
        }
    } catch (err) {
        res.status(400).json(`Cannot update User with ID ${_id}.Error: ${err} `);
    }
});

// Delete User by its ID
router.delete("/:id", userAuth, async (req, res, next) => {
    const _id = req.params.id;
    try {
        let user = await userModel.findById(_id)
        if (user) {
            if (user.id == req.userID) {
                user = await userModel.findByIdAndRemove(_id);
                res.status(200).json(`User with ID ${_id} has been deleted`);
            } else res.status(401).json('Unauthorized User')
        } else res.status(203).json(`Cannot find User with ID ${_id}. Enter valid ID`);
    } catch (err) {
        res.status(400).json(`Cannot delete User with ID ${_id}.Error: ${err} `);
    }
}
);

// get User's Orders
router.get("/orders/:id", userAuth, async (req, res, next) => {
    const _id = req.params.id
    try {
        console.log(_id);
        let user = await userModel.findById(_id);
        console.log(user);
        if (user) {
            if (user.id == req.userID) {
                let orders = await orderModel.find({ userID: _id });
                if (orders) {
                    res.status(200).json(orders);
                } else res.status(200).json(`no Orders founded belong to this User`);
            } else res.status(401).json('Unauthorized User')
        } else res.status(203).json(`invalid User ID `);
    } catch (err) {
        res.status(400).json(`Cannot get User Orders. Error: ${err}`);
    }
});

module.exports = router;
