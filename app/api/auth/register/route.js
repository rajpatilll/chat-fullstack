import { connectToDatabase } from "../../../../lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    const { username, email, password } = await req.json()


    if (!username || !email || !password) {
      return Response.json({ message: "All fields are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    
    const existingUser = await db.collection("users").findOne({
      $or: [{ email }, { username }],
    })

    if (existingUser) {
      return Response.json({ message: "Username or email already exists" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.collection("users").insertOne({
      username,
      email,
      password: hashedPassword,
      createdAt: new Date(),
    })

    const user = {
      _id: result.insertedId,
      username,
      email,
    }

    return Response.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return Response.json({ message: "Registration failed" }, { status: 500 })
  }
}

