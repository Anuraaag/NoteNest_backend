const express = require('express')
const router = express.Router()
const User = require('../models/User') // import a model that's to be used, just like in laravel-8
const { body, validationResult } = require('express-validator')

//second arg contains the rules
router.post('/', [
    body('name', 'Enter a valid name').isLength({min: 3}),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({min: 5})
], 

(req, res) => {

    //Checking for error based on aforementioned rules
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({error: errors.array() })
    }

    //Creating user 
    // try {
     
        User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        }).then(user => res.json(user))
        .catch(error => res.status(400).json({error: error }))
    
    // } catch (error) {
        
    // }

    // res.send(req.body)
})

module.exports = router