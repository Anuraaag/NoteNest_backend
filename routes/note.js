const express = require('express')
const router = express.Router()
const fetchUser = require('../middleware/fetchUser')
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator')


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
                return res.status(400).json({
                    'success': false,
                    'payload': {
                        'message': errors.array()[0].msg,
                        'data': [],
                        'error': errors.array()
                    }
                })
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

            res.send({
                'success': true,
                'payload': {
                    'message': `saved note`,
                    'data': savedNote,
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

/* Route-2: Fetching all notes for a user - /api/note/fetch */
router.get('/fetch', fetchUser,
    async (req, res) => {
        try {
            //Fetching and returning notes
            const notes = await Note.find({ user: req.user.id })
            res.json({
                'success': true,
                'payload': {
                    'message': "notes",
                    'data': notes,
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
                return res.status(400).json({
                    'success': false,
                    'payload': {
                        'message': errors.array()[0].msg,
                        'data': [],
                        'error': errors.array()
                    }
                })
            }

            //Checking if the note exists
            let note = await Note.findById(req.params.id) // db crud is async
            if (!note) {
                return res.status(404).json({
                    'success': false,
                    'payload': {
                        'message': "Note not found",
                        'data': [],
                        'error': []
                    }
                })
            }

            // checking if the note belongs to this user
            if (note.user.toString() !== req.user.id) {
                return res.status(401).json({
                    'success': false,
                    'payload': {
                        'message': "Not Allowed",
                        'data': [],
                        'error': []
                    }
                })
            }

            //Updating the note
            const { title, description, tag } = req.body
            const updateInfo = {}
            if (title) updateInfo.title = title
            if (description) updateInfo.description = description
            if (tag) updateInfo.tag = tag

            const updatedNote = await Note.findByIdAndUpdate(req.params.id, { $set: updateInfo }, { new: true })

            res.json({
                'success': true,
                'payload': {
                    'message': `updated note`,
                    'data': updatedNote,
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


/* Route-4: Deleting a note for a user - /api/note/delete */
router.delete('/delete/:id', fetchUser, async (req, res) => {
    try {

        //Checking if the note exists
        let note = await Note.findById(req.params.id) // db crud is async
        if (!note) {
            return res.status(404).json({
                'success': false,
                'payload': {
                    'message': `Note not found`,
                    'data': updatedNote,
                    'error': []
                }
            })
        }

        // checking if the note belongs to this user
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send({
                'success': false,
                'payload': {
                    'message': `Not Allowed`,
                    'data': [],
                    'error': []
                }
            })
        }

        //Deleting the note
        const nodeDeleted = await Note.findByIdAndDelete(req.params.id)
        res.json({
            'success': true,
            'payload': {
                'message': `deleted note`,
                'data': nodeDeleted,
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

module.exports = router