import "./globals.css"

export const metadata = {
  title: "Real-Time Chat App",
  description: "A real-time chat application built with Next.js, Node.js, Socket.io, and MongoDB",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">{children}</body>
    </html>
  )
}

