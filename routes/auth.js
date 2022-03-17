const express = require('express')
const router = express.Router()
const User = require('../models/User') // import a model that's to be used, just like in laravel-8
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");

const JWT_Secret = "fg7erfgt543r%^$#"

/*  Creating a new user  */
//first argument has the path, second arg contains the rules, third implements the body
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
],

    async (req, res) => {

        try {

            //Checking for error based on aforementioned rules
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() })
            }

            //Checking if user already exists
            let user = await User.findOne({ email: req.body.email }) // db crud is async
            if (user) {
                return res.status(400).json({ 'error': "This email is already taken" })
            }

            //Creating user 
            const salt = await bcrypt.genSalt()
            const hash = await bcrypt.hash(req.body.password, salt)

            user = await User.create({ // db crud is async
                name: req.body.name,
                email: req.body.email,
                password: hash
            })

            // User completes registration, so we create and send them a JWT token
            const payload = {
                user: {
                    id: user.id
                }
            }
            const jwtToken = jwt.sign(payload, JWT_Secret)
            res.json({ 'authToken': jwtToken })

        } catch (error) {
            res.status(400).json({ 'error': error })
        }
    }
)


/*  Logging in a new user  */
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists()
],

    async (req, res) => {

        try {

            //Checking for error based on aforementioned rules
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() })
            }

            //Checking if user exists
            let user = await User.findOne({ email: req.body.email }) // db crud is async
            if (!user) {
                return res.status(400).json({ 'error': "Please enter the correct credentials" })
            }

            //Verifying password
            const passwordCompare = await bcrypt.compare(req.body.password, user.password)
            if (!passwordCompare) {
                return res.status(400).json({ 'error': "Please enter the correct credentials" })
            }

            // User is authenticated already, so we create and send them a JWT token
            const payload = {
                user: {
                    id: user.id
                }
            }
            const jwtToken = jwt.sign(payload, JWT_Secret)
            res.json({ 'authToken': jwtToken })

        } catch (error) {
            res.status(400).json({ 'error': error })
        }
    }
)



module.exports = router