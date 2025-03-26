import { connectToDatabase } from "../../../../lib/mongodb"
import bcrypt from "bcryptjs"

export async function POST(req) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return Response.json({ message: "All fields are required" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Find user by username or email
    const user = await db.collection("users").findOne({
      $or: [{ username }, { email: username }],
    })

    if (!user) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return Response.json({ message: "Invalid credentials" }, { status: 401 })
    }

    // Return user data (excluding password)
    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
    }

    return Response.json({ user: userData })
  } catch (error) {
    console.error("Login error:", error)
    return Response.json({ message: "Login failed" }, { status: 500 })
  }
}

