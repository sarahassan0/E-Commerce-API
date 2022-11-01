const express = require("express");
var bcrypt = require("bcrypt");
const sellerModel = require("../models/Seller");
const productModel = require("../models/Product");
var jwt = require("jsonwebtoken")
const dotenv = require('dotenv');
const sellerAuth = require("../middlewares/sellerAuth");
dotenv.config();


const router = express.Router();



// Handling clint requests
//register new Seller
router.post("/", async (req, res, next) => {
    try {
        let newSeller = req.body;
        let seller = await sellerModel.create(newSeller);
        const token = jwt.sign({
            data: { sellerID: seller.id, sellerUsername: seller.username }
        }, process.env.JWT_SECRET, { expiresIn: '29 days' });
        res.status(201).json({ seller, token })
    } catch (err) {
        res.status(400).json(`Unable to create Seller. Error: ${err}`);
    }
});



// login Seller
router.post("/login", async function (req, res, next) {
    const { username, password } = req.body;
    try {
        let seller = await sellerModel.findOne({ username: username }).exec()
        if (seller) {
            const validpass = bcrypt.compareSync(password, seller.password);
            if (validpass) {
                const token = jwt.sign({
                    data: { sellerID: seller.id, sellerUsername: seller.username }
                }, process.env.JWT_SECRET, { expiresIn: '29 days' });
                res.status(202).json({ seller, token })
            } else {
                res.status(203).json("Cannot login. Incorrect Seller username or password , try again")
            }
        } else {
            res.status(203).json("Cannot login. Incorrect Seller username or password , try again");
        }
    } catch (err) {
        res.status(400).json(`Unable to add new Seller. Error: ${err}`)

    }
});



// get Seller by its ID
router.get("/:id", sellerAuth, async (req, res, next) => {
    const _id = req.params.id;
    try {
        let seller = await sellerModel.findById(_id)
        if (seller && seller.id == req.sellerID) {
            seller = await sellerModel.findById(_id).populate('products');
            res.status(200).json(seller);
        } else res.status(401).json('Unauthorized Seller')
    } catch (err) {
        res.status(400).json(`Cannot get Seller with ID ${_id}. Error: ${err}`);
    }
});


// Update Seller by it's ID
router.patch("/:id", sellerAuth, async (req, res, next) => {
    const _id = req.params.id;
    let updatedSeller = req.body;
    let password = req.body.password
    try {
        let seller = await sellerModel.findById(_id);
        if (seller) {
            if (seller.id == req.sellerID) {

                if (password) {
                    const salt = bcrypt.genSaltSync(15);
                    const hashedPass = bcrypt.hashSync(password, salt);
                    updatedSeller.password = hashedPass
                    await sellerModel.findByIdAndUpdate(_id, updatedSeller, {
                        runValidators: true,
                    });
                    res.status(200).json(`this Seller has been updated , also password updated`);
                } else {
                    await sellerModel.findByIdAndUpdate(_id, updatedSeller, {
                        runValidators: true,
                    });
                    res.status(200).json(`this Seller has been updated `);
                }
            } else res.status(401).json('Unauthorized Seller')
        } else {
            res.status(203).json(`Please enter valid Seller's ID`);
        }
    } catch (err) {
        res.status(400).json(`Cannot update Seller with ID ${_id}.Error: ${err} `);
    }
});

// Delete Seller by its ID
router.delete("/:id", sellerAuth, async (req, res, next) => {
    const _id = req.params.id;
    try {
        let seller = await sellerModel.findById(_id)
        if (seller) {
            if (seller.id == req.sellerID) {
                seller = await sellerModel.findByIdAndRemove(_id);
                res.status(200).json(`Seller with ID ${_id} has been deleted`);
            } else res.status(401).json('Unauthorized Seller')
        } else res.status(203).json(`Cannot find Seller with ID ${_id}. Enter valid ID`);
    } catch (err) {
        res.status(400).json(`Cannot delete Seller with ID ${_id}.Error: ${err} `);
    }
}
);

// get Seller's Products  
router.get("/products/:id", sellerAuth, async (req, res, next) => {
    const _id = req.params.id;
    try {
        let seller = await sellerModel.findById(_id);
        if (seller) {
            if (seller.id == req.sellerID) {
                let products = await productModel.find({ sellerID: _id }).populate('sellerID');
                if (products) {
                    res.status(200).json(products);
                } else res.status(404).json(`no Products founded`);
            } else res.status(401).json('Unauthorized Seller')
        } else res.status(203).json(`invalid Seller ID `);

    } catch (err) {
        res.status(400).json(`Cannot get Seller's Products. Error: ${err}`);
    }
});

module.exports = router;
