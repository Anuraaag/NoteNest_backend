const connectToMongo = require('./db')
const express = require('express')
const cors = require('cors')

connectToMongo()

const app = express()
const port = 5000

app.use(cors())
app.use(express.json()) // required to handle the request body (req.body)

// app.use forwards a request to another location
// a request made on this link will be forwarded to the mentioned location, to handle it there
app.use('/api/auth', require('./routes/auth'))
app.use('/api/note', require('./routes/note'))


app.listen(port, () => {
  console.log(`NoteNest is listening on port ${port}`)
})