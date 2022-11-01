const express = require("express");
const productModel = require("../models/Product");
const sellerModel = require("../models/Seller");
const sellerAuth = require('../middlewares/sellerAuth')
const userAuth = require('../middlewares/userAuth')

const router = express.Router()



// Handling clint requests
//add new Product 
router.post('/', sellerAuth, async (req, res, next) => {
    let newProd = req.body
    try {
        let seller = await sellerModel.findById(req.sellerID)
        if (seller) {
            newProd.sellerID = req.sellerID
            let prod = await (await productModel.create(newProd)).populate('sellerID')
            await sellerModel.findByIdAndUpdate(req.sellerID, { $push: { "products": prod.id } }, { runValidators: true })
            res.status(201).json(prod)
        } else res.status(401).json(`Invalid Seller ID. This Seller cannot add Product`)
    } catch (err) {
        res.status(400).json(`Unable to add new Product. Error: ${err}`)
    }
})




//search for Products by specific required filters --- Product name / Seller name / Or both ----
router.get('/search1', userAuth, async (req, res, next) => {

    let _name = req.query.name
    let _seller = req.query.seller
    try {
        if (_seller) {
            const seller = await sellerModel.findOne({ username: _seller })
            if (seller) {
                const sellerProds = await sellerModel.findOne({ username: _seller }, { '_id': 0, 'products': 1 }).populate({
                    path: 'products',
                    model: 'Product'
                })

                if (_name) {
                    let prods = sellerProds.products.filter(prod => {
                        return prod.name == _name
                    })
                    prods.length > 0 ? res.status(200).json(prods) : res.status(404).json(`This seller doesn't has this Product right now. Try again later `)
                } else sellerProds.products.length > 0 ? res.status(200).json(sellerProds.products) : res.status(404).json(`This seller doesn't has any Products . Try again later `)

            } else {
                res.json(`Invalid Seller name`)
            }
        } else if (_name) {
            let prods = await productModel.find({ name: _name })
            prods.length > 0 ? res.status(200).json(prods) : res.status(404).json(`There are no Products available with this name`)
        } else {
            res.status(404).json(`Please Enter valid Product name or Seller name to search`)
        }
    } catch (err) {
        res.status(400).json(err)
    }

})




// Another solution to search by one specific field  --- Product name / Seller name ----
router.get('/search2', userAuth, async (req, res, next) => {
    let _name = req.query.name
    let _seller = req.query.seller
    try {
        if (_name) {
            let prods = await productModel.find({ name: _name })
            prods.length > 0 ? res.status(200).json(prods) : res.status(404).json(`There are no Products available with this name`)
        }
        else if (_seller) {
            const seller = await sellerModel.findOne({ username: _seller })
            if (seller) {
                const sellerProds = await sellerModel.findOne({ username: _seller }, { '_id': 0, 'products': 1 }).populate({
                    path: 'products',
                    model: 'Product'
                })
                sellerProds.products.length > 0 ? res.status(200).json(sellerProds.products) : res.status(404).json(`This seller doesn't has Products right now. Try again later `)
            } else {
                res.status(404).json(`Invalid Seller name`)
            }
        } else res.status(404).json(`please enter valid Product name or Seller name to search`)
    } catch (err) {
        res.status(400).json(err)
    }

})



// get all Products
router.get('/', async (req, res, next) => {
    try {
        let prods = await productModel.find()
        res.status(200).json(prods)
    } catch (err) {
        res.status(400).json(`Cannot get Product with ID ${_id}. Error: ${err}`)
    }
})


// get Product by its ID
router.get('/:id', async (req, res, next) => {
    const _id = req.params.id
    try {
        let prod = await productModel.findById(_id).populate('sellerID')
        if (prod) {
            res.status(200).json(prod)
        } else res.status(404).json(`Invalid Product ID`)
    } catch (err) {
        res.status(400).json(`Cannot get Product with ID ${_id}. Error: ${err}`)
    }
})


// Update Product by its ID
router.patch('/:id', sellerAuth, async (req, res, next) => {
    const _id = req.params.id
    updatedProd = req.body
    try {
        var prod = await productModel.findById(_id)
        if (prod) {
            if (prod.sellerID == req.sellerID) {
                await productModel.findByIdAndUpdate(_id, updatedProd, { runValidators: true })
                res.status(200).json(`this Product has been updated`)
            } else res.status(401).json('Unauthorized Seller Cannot edit this Product')
        } else res.status(404).json(`Invalid Product ID`)
    } catch (err) {
        res.status(400).json(`Cannot update Product with ID ${_id}. Error: ${err}`)
    }
})



// Delete Product by its ID
router.delete('/:id', sellerAuth, async (req, res, next) => {
    const _id = req.params.id
    try {
        var prod = await productModel.findById(_id)
        if (prod) {
            if (prod.sellerID == req.sellerID) {
                await productModel.findByIdAndRemove(_id)
                res.status(200).json(`Product with ID ${_id} has been deleted`)
            } else res.status(401).json('Unauthorized Seller Cannot delete this Product')
        } else {
            res.status(203).json(`Invalid Product ID`)
        }
    } catch (err) {
        res.status(400).json(`Cannot delete Product with ID ${_id}. Error: ${err}`)
    }
})







module.exports = router