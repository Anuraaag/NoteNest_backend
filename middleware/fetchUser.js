const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET+""

const fetchUser = (req, res, next) => {

    try {
        const JWT = req.header('auth-token') // fetching jwt from the request header

        if (!JWT) {
            res.status(401).send({
                'success': false,
                'payload': {
                    'message': `Please provide a valid JWT`,
                    'data': [],
                    'error': []
                }
            })
        }

        const data = jwt.verify(JWT, JWT_SECRET)
        req.user = data.user
        next()
        // next represents the next function to be executed, once the middleware is run

    } catch (error) {
        res.status(401).send({
            'success': false,
            'payload': {
                'message': `Please provide a valid JWT`,
                'data': [],
                'error': []
            }
        })
    }

}

module.exports = fetchUser