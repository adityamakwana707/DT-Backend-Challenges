const express = require('express')
const myUpload = require('../upload')
const ctrl = require('../controllers/eventController')

const router = express.Router()

function handleUploadIssues(err, req, res, next) {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'file is way too big. max 5mb' })
    }
    return res.status(400).json({ error: err.message })
  }
  next()
}

router.get('/events', (req, res, next) => {
  if (req.query.id) {
    return ctrl.getEventById(req, res, next)
  }
  
  if (req.query.type === 'latest') {
    return ctrl.getLatestEvents(req, res, next)
  }
  
  res.status(400).json({ 
    error: 'u need to pass either id or type=latest query params'
  })
})

router.post(
  '/events',
  myUpload.single('files[image]'),
  handleUploadIssues,
  ctrl.createEvent
)

router.put(
  '/events/:id',
  myUpload.single('files[image]'),
  handleUploadIssues,
  ctrl.updateEvent
)

router.delete('/events/:id', ctrl.deleteEvent)

module.exports = router
