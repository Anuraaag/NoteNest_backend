const express = require('express')
const router = express.Router()
const User = require('../models/User') // import a model that's to be used, just like in laravel-8
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken");

const fetchUser = require("../middleware/fetchUser")

const JWT_Secret = "fg7erfgt543r%^$#"

/* Route-1: Creating a new user - /api/auth/createUser */
//first argument has the path, second arg contains the rules, third implements the body
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be at least 5 characters').isLength({ min: 5 })
],

    async (req, res) => {
        try {

            //Checking for errors based on aforementioned rules
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    'success': false,
                    'payload': {
                        'message': errors.array()[0].msg,
                        'data': [],
                        'error': errors.array()
                    }
                })
            }

            //Checking if user already exists
            let user = await User.findOne({ email: req.body.email }) // db crud is async
            if (user) {
                return res.status(400).json({
                    'success': false,
                    'payload': {
                        'message': `This email is already taken`,
                        'data': [],
                        'error': []
                    }
                })
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

            res.json({
                'success': true,
                'payload': {
                    'message': "jwt auth token",
                    'data': jwtToken,
                    'error': errors.array()
                }
            })


        } catch (error) {
            console.log(error)
            res.status(500).send({
                'success': false,
                'payload': {
                    'message': "Internal Server Error",
                    'data': [],
                    'error': []
                }
            })
        }
    }
)


/* Route-2: Logging in a new user - /api/auth/login */
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password can not be blank').exists()
],

    async (req, res) => {
        try {

            //Checking for error based on aforementioned rules
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    'success': false,
                    'payload': {
                        'message': errors.array()[0].msg,
                        'data': [],
                        'error': errors.array()
                    }
                })

            }

            //Checking if user exists
            let user = await User.findOne({ email: req.body.email }) // db crud is async
            if (!user) {
                return res.status(400).json({
                    'success': false,
                    'payload': {
                        'message': "Please enter the correct credentials",
                        'data': [],
                        'error': []
                    }
                })
            }

            //Verifying password
            const passwordCompare = await bcrypt.compare(req.body.password, user.password)
            if (!passwordCompare) {
                return res.status(400).json({
                    'success': false,
                    'payload': {
                        'message': "Please enter the correct credentials",
                        'data': [],
                        'error': []
                    }
                })
            }

            // User is authenticated already, so we create and send them a JWT token
            const payload = {
                user: {
                    id: user.id
                }
            }
            const jwtToken = jwt.sign(payload, JWT_Secret)
            res.json({
                'success': true,
                'payload': {
                    'message': "jwt auth token",
                    'data': jwtToken,
                    'error': []
                }
            })

        } catch (error) {
            console.log(error)
            res.status(500).send({
                'success': false,
                'payload': {
                    'message': "Internal Server Error",
                    'data': [],
                    'error': []
                }
            })
        }
    }
)


/* Route-3: Verifying the JWT sent by the user - /api/auth/getUser */
/* Again, it is clear here that JWT is not used for authentication, but for authorization post authentication */
router.post('/getUser', fetchUser, async (req, res) => {
    try {
        userId = req.user.id
        const user = await User.findById(userId).select("-password") // fetch all user details except the password
        res.send({
            'success': true,
            'payload': {
                'message': "user details",
                'data': user,
                'error': []
            }
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            'success': false,
            'payload': {
                'message': "Internal Server Error",
                'data': [],
                'error': []
            }
        })
    }
})
/* The fetch user is a middleware, which runs before the async function. It simply gets the JWT from request header 
and verifies it. If the JWT is correct, it appends the userID to the req, which is used in the async function */


module.exports = router