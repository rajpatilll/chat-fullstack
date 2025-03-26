"use client"

import { useState, useEffect } from "react"
import { io } from "socket.io-client"
import Login from "../components/login"
import ChatRoom from "../components/chat-room"

export default function Home() {
  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("chatUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)


    const socketInstance = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
    setSocket(socketInstance)


    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem("chatUser", JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem("chatUser")
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-4 md:p-24">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="p-4 bg-primary text-white">
          <h1 className="text-2xl font-bold">Real-Time Chat App</h1>
          {user && (
            <div className="flex justify-between items-center">
              <p>Welcome, {user.username}</p>
              <button onClick={handleLogout} className="px-3 py-1 bg-white text-primary rounded hover:bg-gray-100">
                Logout
              </button>
            </div>
          )}
        </div>

        {user ? <ChatRoom socket={socket} user={user} /> : <Login onLogin={handleLogin} />}
      </div>
    </main>
  )
}

