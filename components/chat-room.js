"use client"

import { useState, useEffect, useRef } from "react"

export default function ChatRoom({ socket, user }) {
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch("/api/messages")
        const data = await response.json()

        if (response.ok) {
          setMessages(data)
        }
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()
  }, [])


  useEffect(() => {
    if (!socket) return


    socket.on("message", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage])
    })

    socket.on("users", (updatedUsers) => {
      setUsers(updatedUsers)
    })


    socket.emit("join", { userId: user._id, username: user.username })


    return () => {
      socket.off("message")
      socket.off("users")
      socket.emit("leave", { userId: user._id })
    }
  }, [socket, user])


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = (e) => {
    e.preventDefault()

    if (!message.trim()) return


    socket.emit("sendMessage", {
      userId: user._id,
      username: user.username,
      text: message,
    })

    setMessage("")
  }

  if (loading) {
    return <div className="p-6 text-center">Loading messages...</div>
  }

  return (
    <div className="flex h-[70vh]">
      {/* Chat messages */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.userId === user._id ? "text-right" : ""}`}>
                <div
                  className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                    msg.userId === user._id ? "bg-primary text-white" : "bg-gray-200"
                  }`}
                >
                  {msg.userId !== user._id && <div className="font-bold text-sm">{msg.username}</div>}
                  <div>{msg.text}</div>
                  <div className="text-xs opacity-70 mt-1">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-l"
            />
            <button type="submit" className="px-4 bg-primary text-white rounded-r hover:bg-primary/90">
              Send
            </button>
          </div>
        </form>
      </div>

      
      <div className="w-64 border-l bg-gray-50 p-4 hidden md:block">
        <h3 className="font-bold mb-4">Online Users</h3>
        {users.length === 0 ? (
          <div className="text-gray-500">No users online</div>
        ) : (
          <ul>
            {users.map((onlineUser) => (
              <li
                key={onlineUser.userId}
                className={`p-2 rounded ${onlineUser.userId === user._id ? "bg-gray-200" : ""}`}
              >
                {onlineUser.username} {onlineUser.userId === user._id && "(You)"}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

