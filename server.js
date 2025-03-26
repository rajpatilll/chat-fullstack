const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const cors = require("cors")
const { MongoClient } = require("mongodb")
require("dotenv").config()

// MongoDB connection
const uri = process.env.MONGODB_URI
const client = new MongoClient(uri)


const app = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

// Connected users
const connectedUsers = new Map()

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect()
    console.log("Connected to MongoDB")
    return client.db()
  } catch (error) {
    console.error("MongoDB connection error:", error)
    process.exit(1)
  }
}


io.on("connection", (socket) => {
  console.log("New client connected:", socket.id)


  socket.on("join", async ({ userId, username }) => {

    connectedUsers.set(socket.id, { userId, username })


    io.emit("users", Array.from(connectedUsers.values()))

    console.log(`${username} joined the chat`)
  })


  socket.on("sendMessage", async (messageData) => {
    try {
      const db = client.db()


      const message = {
        ...messageData,
        timestamp: new Date(),
      }


      await db.collection("messages").insertOne(message)


      io.emit("message", message)
    } catch (error) {
      console.error("Error saving message:", error)
    }
  })


  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id)
    if (user) {
      console.log(`${user.username} left the chat`)
      connectedUsers.delete(socket.id)

      io.emit("users", Array.from(connectedUsers.values()))
    }
  })

  socket.on("leave", ({ userId }) => {
    connectedUsers.delete(socket.id)
    io.emit("users", Array.from(connectedUsers.values()))
  })
})


const PORT = process.env.PORT || 3001

async function startServer() {
  try {
    const db = await connectToMongo()

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("Failed to start server:", error)
  }
}

startServer()

