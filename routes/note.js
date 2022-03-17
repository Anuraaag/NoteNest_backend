const express = require('express')
const router = express.Router()
const fetchUser = require('../middleware/fetchUser')
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator')


/* Route-1: Fetching all notes for a user - /api/note/fetch */
router.get('/fetch', fetchUser,
    async (req, res) => {
        try {
            //Fetching and returning notes
            const notes = await Note.find({ user: req.user.id })
            res.json({ notes })

        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Server Error")
        }
    }
)


/* Route-2: Adding a note for a user - /api/note/create */
router.post('/create', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 })
],
    async (req, res) => {
        try {

            //Checking for errors based on aforementioned rules
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json({ error: errors.array() })
            }

            // const {title, description, tag} = req.body
            // const note = new Note({
            //     title, description, tag, user: req.user.id
            // })
            // const savedNote = await note.save()

            const savedNote = await Note.create({
                title: req.body.title,
                description: req.body.description,
                tag: req.body.tag,
                user: req.user.id
            })
            
            res.send({ savedNote })

        } catch (error) {
            console.log(error)
            res.status(500).send("Internal Server Error")
        }
    }
)

module.exports = router