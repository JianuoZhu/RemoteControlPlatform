// src/pages/VideoControl.tsx
import React, { useState, useRef, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import { Button, Dropdown, DropdownItem } from 'flowbite-react'
type Mode = 'idle' | 'selecting' | 'broadcaster' | 'viewer'
const SIGNALING_SERVER_URL = 'https://120.232.252.116:5101'

export default function VideoControl() {
  // — state & refs —
  const [mode, setMode] = useState<Mode>('idle')
  const modeRef = useRef<Mode>('idle')
  const [broadcasters, setBroadcasters] = useState<string[]>([])
  const [selectedBroadcaster, setSelectedBroadcaster] = useState<string>('')
  const [latency, setLatency] = useState<number|null>(null)

  const localVid  = useRef<HTMLVideoElement>(null)
  const remoteVid = useRef<HTMLVideoElement>(null)
  const pcRef     = useRef<RTCPeerConnection | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const targetId  = useRef<string | null>(null)
  const statsIntervalRef = useRef<number>()

  // keep modeRef in sync
  useEffect(() => { modeRef.current = mode }, [mode])

  // — signaling 初始化，只跑一次 —
  useEffect(() => {
    const socket = io(SIGNALING_SERVER_URL, { secure: true })
    socketRef.current = socket

    socket.on('connect', () =>
      console.log('Connected:', socket.id)
    )
    socket.on('broadcasters-list', (list: string[]) => {
      setBroadcasters(list)
    })
    socket.on('remove-broadcaster', (id: string) => {
      setBroadcasters(prev => prev.filter(x => x !== id))
    })
    socket.on('broadcaster', (id: string) => {
      console.log('New broadcaster online:', id)
      setBroadcasters(prev =>
        prev.includes(id) ? prev : [...prev, id]
      )
    })

    socket.on('viewer', (id: string) => {
      if (modeRef.current === 'broadcaster') {
        console.log('Viewer joined:', id)
        targetId.current = id
        createOffer()
      }
    })
    socket.on('offer', async (_from, desc) => {
      if (modeRef.current === 'viewer' && pcRef.current) {
        targetId.current = _from
        await pcRef.current.setRemoteDescription(desc)
        const answer = await pcRef.current.createAnswer()
        await pcRef.current.setLocalDescription(answer)
        socket.emit('answer', _from, answer)
      }
    })
    socket.on('answer', async (_from, desc) => {
      if (modeRef.current === 'broadcaster' && pcRef.current) {
        await pcRef.current.setRemoteDescription(desc)
      }
    })
    socket.on('candidate', async (_from, cand) => {
      if (pcRef.current) {
        try {
          await pcRef.current.addIceCandidate(cand)
        } catch (e) {
          console.warn('ICE add failed', e)
        }
      }
    })

    // 当对端主动断开
    socket.on('stop', () => {
      console.log('Received stop from peer')
      cleanUp()
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [])

  // ——— 建立 RTCPeerConnection 并监听状态变化 ———
  function createPeerConnection() {
    // 关掉旧的
    cleanUpPC()

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    })
    pcRef.current = pc

    pc.onicecandidate = e => {
      if (e.candidate && targetId.current) {
        socketRef.current?.emit('candidate', targetId.current, e.candidate)
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log('ICE state:', pc.iceConnectionState)
    }

    pc.onconnectionstatechange = () => {
      console.log('Connection state:', pc.connectionState)
      if (pc.connectionState === 'connected') {
        startStats()
      }
      if (['disconnected','failed','closed'].includes(pc.connectionState)) {
        stopStats()
      }
    }

    pc.ontrack = e => {
      if (modeRef.current === 'viewer') {
        remoteVid.current!.srcObject = e.streams[0]
      }
    }

    return pc
  }

  // ——— 计算并更新延迟 ———
  async function startStats() {
    console.log('Starting stats collection...')
    console.log('PeerConnection:', pcRef.current)
    if (!pcRef.current) return
    statsIntervalRef.current = window.setInterval(async () => {
      const stats = await pcRef.current!.getStats()
      stats.forEach(report => {
        console.log('Report:', report)
        console.log('Report type:', report.type)
        if (report.type === 'candidate-pair' && (report as any).nominated) {
          const rtt = (report as any).currentRoundTripTime
          console.log('Current RTT:', rtt)
          if (typeof rtt === 'number') {
            setLatency(Math.round(rtt * 1000))
          }
        }
      })
    }, 1000)
  }
  function stopStats() {
    if (statsIntervalRef.current) {
      clearInterval(statsIntervalRef.current)
      statsIntervalRef.current = undefined
    }
    setLatency(null)
  }

  // ——— broadcaster 发 Offer ———
  async function createOffer() {
    const pc = pcRef.current!
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    socketRef.current?.emit('offer', targetId.current, offer)
  }

  // ——— 点击“开始发送” ———
  async function startBroadcast() {
    setMode('broadcaster')
    const pc = createPeerConnection()
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    localVid.current!.srcObject = stream
    stream.getTracks().forEach(track => pc.addTrack(track, stream))
    socketRef.current?.emit('broadcaster')
  }

  // ——— 点击“开始接收” ———
  function handleViewerSelect() {
    socketRef.current?.emit('get-broadcasters')
    setMode('selecting')
  }

  // ——— 取消选择 ———
  function cancelSelect() {
    setMode('idle')
    setSelectedBroadcaster('')
  }

  // ——— 选好后真正开始 Viewer ———
  function startViewerWithId(id: string) {
    setMode('viewer')
    const pc = createPeerConnection()
    targetId.current = id
    socketRef.current?.emit('viewer', id)
  }

  // ——— 断开连接清理 ———
  function cleanUpPC() {
    if (pcRef.current) {
      pcRef.current.close()
      pcRef.current = null
    }
  }
  function cleanUp() {
    // 停止媒体
    if (localVid.current?.srcObject instanceof MediaStream) {
      localVid.current.srcObject.getTracks().forEach(t => t.stop())
      localVid.current.srcObject = null
    }
    if (remoteVid.current?.srcObject instanceof MediaStream) {
      remoteVid.current.srcObject.getTracks().forEach(t => t.stop())
      remoteVid.current.srcObject = null
    }
    // 关闭 PeerConnection & Stats
    cleanUpPC()
    stopStats()

    // 重置状态
    targetId.current = null
    setSelectedBroadcaster('')
    setMode('idle')
  }

  // ——— 点击断开按钮 ———
  function handleDisconnect() {
    if (targetId.current) {
      socketRef.current?.emit('stop', targetId.current)
    }
    cleanUp()
  }

  // ——— UI 渲染 ———
  return (
    <div className="relative h-full space-y-4">
      <h1 className="text-2xl font-semibold text-center">远程视频监控</h1>

      {/* Idle：选择发送 or 接收 */}
      {mode === 'idle' && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                      flex flex-nowrap gap-10 justify-center"
        >
          <Button color="red" pill size="xl" onClick={startBroadcast}>
            开始发送
          </Button>
          <Button color="green" pill size="xl" onClick={handleViewerSelect}>
            开始接收
          </Button>
        </div>
      )}

      {/* Selecting：选择具体哪个 broadcaster */}
      {mode === 'selecting' && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        bg-white p-6 rounded shadow flex flex-col gap-4 items-center">
          {broadcasters.length > 0 ? (
            <>
              <Dropdown color="cyan" label={selectedBroadcaster || '请选择发送端'}>
                {broadcasters.map(id => (
                  <DropdownItem key={id} onClick={() => setSelectedBroadcaster(id)}>
                    {id}
                  </DropdownItem>
                ))}
              </Dropdown>
              <div className="flex gap-4">
                <Button color='blue'
                  disabled={!selectedBroadcaster}
                  onClick={() => startViewerWithId(selectedBroadcaster)}
                >
                  连接
                </Button>
                <Button color="gray" onClick={cancelSelect}>
                  取消
                </Button>
              </div>
            </>
          ) : (
            <p>当前无可用发送端</p>
          )}
        </div>
      )}

      {/* Broadcaster 或 Viewer：显示延迟 + 进度 + 视频 + 断开按钮 */}
      {(mode === 'broadcaster' || mode === 'viewer') && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
                        bg-white p-6 rounded shadow flex flex-col gap-4 items-center">
          {/* 延迟显示 */}
          <p>延迟: {latency !== null ? `${latency} ms` : '--'} </p>
          {/* 视频 */}
          <div className="flex justify-center">
            <video
              ref={mode === 'broadcaster' ? localVid : remoteVid}
              autoPlay
              playsInline
              muted={mode === 'broadcaster'}
              className="h-128 bg-black rounded"
            />
          </div>
          {/* 断开连接按钮 */}
          <Button color="gray" onClick={handleDisconnect}>
            断开连接
          </Button>
        </div>
      )}
    </div>
  )
}
