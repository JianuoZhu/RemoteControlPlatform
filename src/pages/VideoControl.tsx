import React, { useState, useRef, useEffect } from 'react'
import io from 'socket.io-client'

// 信令服务器地址（改成你的服务器 IP 或域名）
const SIGNALING_SERVER_URL = 'https://192.168.23.23:5000'

export default function VideoControl() {
  const localVid  = useRef(null)
  const remoteVid = useRef(null)
  const pcRef     = useRef(null)
  const socketRef = useRef(null)
  const targetId  = useRef(null)

  const [mode, setMode] = useState<'idle'|'broadcaster'|'viewer'>('idle')

  // 1. 初始化 Socket.io & 信令处理
  useEffect(() => {
    const socket = io(SIGNALING_SERVER_URL, { secure: true })
    socketRef.current = socket

    socket.on('connect', () => console.log('🔌 信令服务器已连接', socket.id))
    socket.on('broadcaster', () => {
      // 有 broadcaster 来了，若自己是 viewer 则发起 viewer 通知
      if (mode === 'viewer') {
        socket.emit('viewer')
        console.log('Received broadcaster connection:', socket.id)
      }
    })
    socket.on('viewer', id => {
      // 有 viewer 来了，若自己是 broadcaster 则记住 viewer id，发起 offer
      if (mode === 'broadcaster') {
        console.log('Received viewer connection:', id)
        targetId.current = id
        createOffer()
      }
    })
    socket.on('offer', async (id, desc) => {
      // 收到 broadcaster 的 offer，自己是 viewer
      if (mode === 'viewer') {
        console.log('Received offer from broadcaster:', id)
        targetId.current = id
        await pcRef.current.setRemoteDescription(desc)
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        socket.emit('answer', id, pcRef.current.localDescription)
      }
    })
    socket.on('answer', async (id, desc) => {
      // 收到 viewer 的 answer，自己是 broadcaster
      if (mode === 'broadcaster') {
        console.log('Received answer from viewer:', id)
        await pcRef.current.setRemoteDescription(desc)
      }
    })
    socket.on('candidate', async (id, cand) => {
      try {
        await pcRef.current.addIceCandidate(cand)
      } catch (e) {
        console.warn('ICE 添加失败', e)
      }
    })
    socket.on('disconnectPeer', id => {
      console.log('Peer 已断开', id)
      // 可做清理或 UI 提示
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // 2. 创建 RTCPeerConnection + ICE 处理
  function createPeerConnection() {
    pcRef.current = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    pcRef.current.onicecandidate = e => {
      if (e.candidate && targetId.current) {
        socketRef.current.emit('candidate', targetId.current, e.candidate)
      }
    }
    // viewer 接收远端流
    pcRef.current.ontrack = e => {
      if (mode === 'viewer') {
        remoteVid.current.srcObject = e.streams[0]
      }
    }
  }

  // 3. 按钮事件：开始发送
  const startBroadcast = async () => {
    setMode('broadcaster')
    createPeerConnection()

    // 采集摄像头 + 麦克风
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localVid.current.srcObject = stream
    stream.getTracks().forEach(track => pcRef.current.addTrack(track, stream))

    // 通知信令服务器：我想当 broadcaster
    socketRef.current.emit('broadcaster')
  }

  // 4. 按钮事件：开始接收
  const startViewer = () => {
    setMode('viewer')
    createPeerConnection()
    // 通知信令服务器：我想当 viewer
    socketRef.current.emit('viewer')
  }

  // 5. 广播端发起 Offer
  const createOffer = async () => {
    const offer = await pcRef.current.createOffer()
    await pcRef.current.setLocalDescription(offer)
    socketRef.current.emit('offer', targetId.current, pcRef.current.localDescription)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">远程视频监控</h1>

      {mode === 'idle' && (
        <div className="flex space-x-4">
          <button
            className="px-4 py-2 bg-green-500 text-white rounded"
            onClick={startBroadcast}
          >
            开始发送（摄像头）
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded"
            onClick={startViewer}
          >
            开始接收（观看）
          </button>
        </div>
      )}

      {mode === 'broadcaster' && (
        <div>
          <video
            ref={localVid}
            autoPlay
            muted
            playsInline
            className="w-full h-96 bg-black rounded"
          />
          <p className="text-sm text-gray-600">正在作为发送端广播视频流</p>
        </div>
      )}

      {mode === 'viewer' && (
        <div>
          <video
            ref={remoteVid}
            autoPlay
            playsInline
            className="w-full h-96 bg-black rounded"
          />
          <p className="text-sm text-gray-600">正在作为接收端观看视频流</p>
        </div>
      )}
    </div>
  )
}
