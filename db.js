const mongoose = require('mongoose');

mongoUri = "mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false"

const connectToMongo = () => {
    mongoose.connect(mongoUri, () => {
        console.log("connected to mongo")
    })
}

module.exports = connectToMongo