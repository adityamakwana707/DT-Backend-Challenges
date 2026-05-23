const { MongoClient } = require('mongodb')
require('dotenv').config()

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017'
const dbName = process.env.DB_NAME || 'events_db'

let myClient = null
let myDb = null

async function connectDB() {
  if (myDb) {
    return myDb
  }
  
  myClient = new MongoClient(uri, {
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 10000
  })

  await myClient.connect()
  myDb = myClient.db(dbName)
  console.log('connected to db', dbName)
  return myDb
}

function getDB() {
  if (!myDb) throw new Error('u need to connect to db first')
  return myDb
}

async function closeDB() {
  if (myClient) {
    await myClient.close()
    myClient = null
    myDb = null
    console.log('db closed')
  }
}

module.exports = { connectDB, getDB, closeDB }
