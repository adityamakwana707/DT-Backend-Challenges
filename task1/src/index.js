require('dotenv').config()
const path = require('path')
const express = require('express')
const { connectDB, closeDB } = require('./db')
const eventsRoutes = require('./routes/events')

const app = express()
const myPort = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))

app.get('/', (req, res) => {
  res.send({ status: 'server is working', version: 'v3' })
})

app.use('/api/v3/app', eventsRoutes)

app.use((req, res) => {
  res.status(404).send({ error: 'url not found' })
})

app.use((err, req, res, next) => {
  console.log('caught an error:', err)
  res.status(500).json({ error: 'server crash' })
})

async function start() {
  try {
    await connectDB()
    
    let server = app.listen(myPort, () => {
      console.log('server running on port ' + myPort)
    })

    const killServer = async () => {
      console.log('shutting down')
      server.close(async () => {
        await closeDB()
        process.exit(0)
      })
    }

    process.on('SIGINT', killServer)
    process.on('SIGTERM', killServer)

  } catch (err) {
    console.log('could not connect to mongodb', err.message)
    process.exit(1)
  }
}

start()
