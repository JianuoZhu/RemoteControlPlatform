// src/pages/VideoControl.tsx
import React, { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button } from "flowbite-react";
type Mode = 'idle' | 'broadcaster' | 'viewer'
const SIGNALING_SERVER_URL = 'https://120.232.252.116:5101'

export default function VideoControl() {
  // --- 状态 & 引用 ---
  const [mode, setMode] = useState<Mode>('idle')
  const modeRef = useRef<Mode>('idle')
  const localVid  = useRef<HTMLVideoElement>(null)
  const remoteVid = useRef<HTMLVideoElement>(null)
  const pcRef     = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const targetId  = useRef<string | null>(null)

  // 保持 modeRef 最新
  useEffect(() => { modeRef.current = mode }, [mode])

  // --- 只在组件挂载时，做一次信令初始化＆绑定，不跟 mode 挂钩 ---
  useEffect(() => {
    const socket = io(SIGNALING_SERVER_URL, { secure: true })
    socketRef.current = socket

    socket.on('connect', () =>
      console.log('Connected to signaling server:', socket.id)
    )

    // 有 broadcaster 上线，viewer 响应
    socket.on('broadcaster', () => {
      if (modeRef.current === 'viewer') {
        console.log('Got broadcaster, emitting viewer')
        socket.emit('viewer')
      }
    })

    // 有 viewer 上线，broadcaster 发 offer
    socket.on('viewer', (id: string) => {
      if (modeRef.current === 'broadcaster') {
        console.log('Viewer joined:', id)
        targetId.current = id
        createOffer()
      }
    })

    // 收到 offer
    socket.on('offer', async (_from, desc) => {
      if (modeRef.current === 'viewer' && pcRef.current) {
        console.log('Offer received')
        targetId.current = _from
        await pcRef.current.setRemoteDescription(desc)
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        socket.emit('answer', _from, answer)
      }
    })

    // 收到 answer
    socket.on('answer', async (_from, desc) => {
      if (modeRef.current === 'broadcaster' && pcRef.current) {
        console.log('Answer received')
        await pcRef.current.setRemoteDescription(desc)
      }
    })

    // 收到 ICE
    socket.on('candidate', async (_from, cand) => {
      if (pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(cand)
          console.log('ICE candidate added')
        } catch (e) {
          console.warn('ICE add failed', e)
        }
      }
    })

    return () => {
      // 组件卸载时再断
      socket.disconnect()
      socketRef.current = null
    }
  }, [])  // ← 依赖数组空，永远只跑这一遍

  // --- PeerConnection 管理 ---
  function createPeerConnection() {
    // 先关掉旧的
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    pcRef.current = pc

    pc.onicecandidate = e => {
      if (e.candidate && targetId.current) {
        socketRef.current?.emit('candidate', targetId.current, e.candidate)
        console.log('Sent local ICE candidate')
      }
    }
    pc.onconnectionstatechange = () =>
      console.log('Connection state:', pc.connectionState)
    pc.oniceconnectionstatechange = () =>
      console.log('ICE state:', pc.iceConnectionState)

    pc.ontrack = e => {
      if (modeRef.current === 'viewer') {
        console.log('📺 Remote track received')
        remoteVid.current!.srcObject = e.streams[0]
      }
    }

    return pc
  }

  // broadcaster 发 Offer
  async function createOffer() {
    const pc = pcRef.current!
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socketRef.current?.emit('offer', targetId.current, offer)
    console.log('📤 Offer sent')
  }

  // 按钮：开始发送
  async function startBroadcast() {
    setMode('broadcaster')
    const pc = createPeerConnection()
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    })
    localVid.current!.srcObject = stream
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
    console.log('Local stream attached')

    socketRef.current?.emit('broadcaster')
    console.log('Broadcasting')
  }

  // 按钮：开始接收
  function startViewer() {
    setMode('viewer')
    createPeerConnection()
    socketRef.current?.emit('viewer')
    console.log('🟦 Viewing')
  }

  // --- UI 渲染 ---
  return (
    <div className="relative h-full space-y-4">
      <h1 className="text-2xl font-semibold text-center">远程视频监控</h1>
      {mode === 'idle' && (
        <div className="flex flex-nowrap gap-10 justify-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Button
            color="red"
            pill
            size="xl"
            className="whitespace-nowrap"
            onClick={startBroadcast}
          >
            开始发送
          </Button>
          <Button
            color="green"
            pill
            size="xl"
            className="whitespace-nowrap"
            onClick={startViewer}
          >
            开始接收
          </Button>
        </div>
      )}
      {mode === 'broadcaster' && (
        <video
          ref={localVid}
          autoPlay
          muted
          playsInline
          className="w-full h-96 bg-black rounded"
        />
      )}
      {mode === 'viewer' && (
        <video
          ref={remoteVid}
          autoPlay
          playsInline
          className="w-full h-96 bg-black rounded"
        />
      )}
    </div>
  )
}
