import { connectToDatabase } from "../../../lib/mongodb"

export async function GET() {
  try {
    const { db } = await connectToDatabase()

    const messages = await db.collection("messages").find({}).sort({ timestamp: -1 }).limit(50).toArray()

    return Response.json(messages.reverse())
  } catch (error) {
    console.error("Error fetching messages:", error)
    return Response.json({ message: "Failed to fetch messages" }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const message = await req.json()
    const { db } = await connectToDatabase()


    if (!message.timestamp) {
      message.timestamp = new Date()
    }

    await db.collection("messages").insertOne(message)

    return Response.json(message, { status: 201 })
  } catch (error) {
    console.error("Error saving message:", error)
    return Response.json({ message: "Failed to save message" }, { status: 500 })
  }
}

