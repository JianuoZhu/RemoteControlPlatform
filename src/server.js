// server.js
const express = require('express')
const http    = require('http')
const { Server } = require('socket.io')

const app = express()
const server = http.createServer(app)
const io = new Server(server, { cors: { origin: '*' } })

io.on('connection', socket => {
  console.log('🔗', socket.id, 'connected')

  // 广播端告诉服务器“我来当 broadcaster”
  socket.on('broadcaster', () => {
    socket.broadcast.emit('broadcaster')
  })

  // 观看端告诉服务器“我来当 viewer”
  socket.on('viewer', () => {
    socket.broadcast.emit('viewer', socket.id)
  })

  // 转发 Offer / Answer / ICE candidate
  socket.on('offer',    (to, sdp) => io.to(to).emit('offer',    socket.id, sdp))
  socket.on('answer',   (to, sdp) => io.to(to).emit('answer',   socket.id, sdp))
  socket.on('candidate',(to, cand)=> io.to(to).emit('candidate',socket.id, cand))

  socket.on('disconnect', () => {
    socket.broadcast.emit('disconnectPeer', socket.id)
  })
})

const PORT = process.env.PORT || 5000
server.listen(PORT, () => console.log(`🚀 Signaling Server running on :${PORT}`))
