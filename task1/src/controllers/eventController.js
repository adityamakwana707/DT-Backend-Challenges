const { ObjectId } = require('mongodb')
const { getDB } = require('../db')

function checkId(id) {
  if (!id || !ObjectId.isValid(id)) return null
  return new ObjectId(id)
}

async function getEventById(req, res) {
  try {
    let id = checkId(req.query.id)
    if (!id) {
      return res.status(400).json({ error: 'bad id passed' })
    }

    let eventDoc = await getDB().collection('events').findOne({ _id: id })
    
    if (!eventDoc) {
      return res.status(404).send({ msg: 'could not find event' })
    }

    res.json({ success: true, data: eventDoc })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: err.message })
  }
}

async function getLatestEvents(req, res) {
  try {
    let limit = parseInt(req.query.limit) || 5
    let page = parseInt(req.query.page) || 1
    let skipPages = (page - 1) * limit
    
    let eventsCollection = getDB().collection('events')
    
    let totalCount = await eventsCollection.countDocuments({ type: 'event' })
    let records = await eventsCollection.find({ type: 'event' }).sort({ schedule: -1 }).skip(skipPages).limit(limit).toArray()

    let pages = Math.ceil(totalCount / limit)

    res.json({
      data: records,
      pagination: { totalCount, page, limit, pages }
    })
  } catch (err) {
    console.log('error getting latest', err)
    res.status(500).json({ error: 'something went wrong' })
  }
}

async function createEvent(req, res) {
  try {
    let b = req.body
    
    let requiredProps = ['name', 'tagline', 'schedule', 'description', 'moderator', 'category', 'sub_category', 'rigor_rank', 'uid']
    let missing = []
    
    for (let p of requiredProps) {
      if (!b[p] || b[p].trim() === '') {
        missing.push(p)
      }
    }
    
    if (missing.length > 0) {
      return res.status(422).json({ error: 'u missed some fields', missing })
    }

    let sched = new Date(b.schedule)
    if (isNaN(sched)) {
       return res.status(422).json({ err: 'date is wrong format' })
    }

    let imgPath = null
    if (req.file) {
      imgPath = req.file.path
    }

    let newEvent = {
      type: 'event',
      uid: b.uid.trim(),
      name: b.name.trim(),
      tagline: b.tagline.trim(),
      schedule: sched,
      description: b.description.trim(),
      files: { image: imgPath },
      moderator: b.moderator.trim(),
      category: b.category.trim(),
      sub_category: b.sub_category.trim(),
      rigor_rank: parseInt(b.rigor_rank),
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    let saved = await getDB().collection('events').insertOne(newEvent)
    res.status(201).json({ success: true, insertedId: saved.insertedId })

  } catch (e) {
    console.log(e)
    res.status(500).json({ status: 'fail', error: e.message })
  }
}

async function updateEvent(req, res) {
  try {
    let targetId = checkId(req.params.id)
    if (!targetId) return res.status(400).json({ err: 'id format bad' })

    let coll = getDB().collection('events')
    let found = await coll.findOne({ _id: targetId })
    if (!found) return res.status(404).json({ error: 'event not there' })

    let updates = {}
    let strFields = ['name', 'tagline', 'description', 'moderator', 'category', 'sub_category', 'uid']
    
    strFields.forEach(f => {
      if (req.body[f] !== undefined && req.body[f].trim() !== '') {
        updates[f] = req.body[f].trim()
      }
    })

    if (req.body.schedule) {
      let d = new Date(req.body.schedule)
      if (!isNaN(d)) {
        updates.schedule = d
      }
    }

    if (req.body.rigor_rank) {
      updates.rigor_rank = parseInt(req.body.rigor_rank)
    }

    if (req.file) {
      updates['files.image'] = req.file.path
    }

    updates.updatedAt = new Date()

    let result = await coll.updateOne({ _id: targetId }, { $set: updates })
    res.json({ success: true, updated: result.modifiedCount })

  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function deleteEvent(req, res) {
  try {
    let theId = checkId(req.params.id)
    if (!theId) return res.status(400).json({ error: 'not valid id' })

    let result = await getDB().collection('events').deleteOne({ _id: theId })
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ msg: 'nothing to delete' })
    }

    res.json({ deleted: true, count: result.deletedCount })
  } catch (e) {
    res.status(500).json({ fail: true, err: e.message })
  }
}

module.exports = {
  getEventById,
  getLatestEvents,
  createEvent,
  updateEvent,
  deleteEvent
}
