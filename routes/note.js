const express = require('express')
const router = express.Router()
const fetchUser = require('../middleware/fetchUser')
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator')


const generateResponse = (success, message = "", data = [], error = []) => {
    const response = {
        'success': success,
        'payload': {
            'message': message,
            'data': data,
            'error': error
        }
    }
    return response
}


/* Route-1: Adding a note for a user - /api/note/create */
router.post('/create', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 })
],
    async (req, res) => {
        try {

            //Checking for errors based on aforementioned rules
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json(generateResponse(false, errors.array()[0].msg, [], errors.array()))
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

            res.send(generateResponse(true, `saved note`, savedNote, []))


        } catch (error) {
            console.log(error)
            res.status(500).send(generateResponse(false, `Internal Server Error`, [], []))
        }
    }
)

/* Route-2: Fetching all notes for a user - /api/note/fetch */
router.get('/fetch', fetchUser,
    async (req, res) => {
        try {
            //Fetching and returning notes
            const notes = await Note.find({ user: req.user.id })
            res.json(generateResponse(true, `notes`, notes, []))

        } catch (error) {
            console.log(error)
            res.status(500).send(generateResponse(false, `Internal Server Error`, [], []))
        }
    }
)


/* Route-3: Updating a note for a user - /api/note/update */
router.put('/update/:id', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be at least 5 characters').isLength({ min: 5 })
],
    async (req, res) => {
        try {

            //Checking for errors based on aforementioned rules
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                return res.status(400).json(generateResponse(false, errors.array()[0].msg, [], errors.array()))
            }

            //Checking if the note exists
            let note = await Note.findById(req.params.id) // db crud is async
            if (!note) {
                return res.status(404).json(generateResponse(false, `Note not found`, [], []))
            }

            // checking if the note belongs to this user
            if (note.user.toString() !== req.user.id) {
                return res.status(401).json(generateResponse(false, `Not Allowed`, [], []))
            }

            //Updating the note
            const { title, description, tag } = req.body
            const updateInfo = {}
            if (title) updateInfo.title = title
            if (description) updateInfo.description = description
            if (tag) updateInfo.tag = tag

            const updatedNote = await Note.findByIdAndUpdate(req.params.id, { $set: updateInfo }, { new: true })

            res.json(generateResponse(true, `updated note`, updatedNote, []))


        } catch (error) {
            console.log(error)
            res.status(500).send(generateResponse(false, `Internal Server Error`, [], []))
        }
    }
)


/* Route-4: Deleting a note for a user - /api/note/delete */
router.delete('/delete/:id', fetchUser, async (req, res) => {
    try {

        //Checking if the note exists
        let note = await Note.findById(req.params.id) // db crud is async
        if (!note) {
            return res.status(404).json(generateResponse(false, `Note not found`, [], []))
        }

        // checking if the note belongs to this user
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send(generateResponse(false, `Not Allowed`, [], []))
        }

        //Deleting the note
        const nodeDeleted = await Note.findByIdAndDelete(req.params.id)
        res.json(generateResponse(true, `deleted note`, nodeDeleted, []))

    } catch (error) {
        console.log(error)
        res.status(500).send(generateResponse(false, `Internal Server Error`, [], []))
    }
})

module.exports = router