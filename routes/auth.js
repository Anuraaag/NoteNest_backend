const express = require('express')
const router = express.Router()
const User = require('../models/User') // import a model that's to be used, just like in laravel-8

router.post('/', (req, res) => {

    const user = User(req.body)
    user.save()
    res.send(req.body)
})

module.exports = router