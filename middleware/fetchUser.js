const jwt = require("jsonwebtoken");
const JWT_Secret = "fg7erfgt543r%^$#"

const fetchUser = (req, res, next) => {
    
    try {
        const JWT = req.header('auth-token') // fetching jwt from the request header
        
        if(!JWT){
            res.status(401).send({error: "Please provide a valid JWT"})
        }
        
        const data = jwt.verify(JWT, JWT_Secret)
        req.user = data.user
        next()
        // next represents the next function to be executed, once the middleware is run

    } catch (error) {
        res.status(401).send({error: "Please provide a valid JWT"})
    }

}

module.exports = fetchUser