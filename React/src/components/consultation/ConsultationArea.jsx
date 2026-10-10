import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'
import Peer from 'peerjs'
import { 
  ArrowLeft, 
  PhoneCall, 
  PhoneOff, 
  Send, 
  Star 
} from 'lucide-react'

const ConsultationArea = ({ appointment, role, onBack, onRateDoctor }) => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [callStatus, setCallStatus] = useState('Disconnected')
  const [peerInstance, setPeerInstance] = useState(null)
  const [activeCall, setActiveCall] = useState(null)
  
  const localVideoRef = useRef(null)
  const remoteVideoRef = useRef(null)
  const localAudioRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const socketRef = useRef(null)
  const localStreamRef = useRef(null)

  const user = JSON.parse(localStorage.getItem('user')) || { user_id: 1, email: 'user@healpoint.com' }

  useEffect(() => {
    // 1. Fetch Message History
    axios.get(`${import.meta.env.VITE_BACKEND_BASE_URL || 'http://localhost:3001/api'}/messages/${appointment.id}`)
      .then(res => setMessages(res.data.messages || []))
      .catch(err => console.error("Error fetching message history:", err))

    // 2. Initialize Socket.io
    const socket = io(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'}`)
    socketRef.current = socket

    socket.emit('join_room', { appointmentId: appointment.id })

    socket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data])
    })

    // 3. Initialize PeerJS (WebRTC) for Audio/Video
    if (appointment.type === 'AUDIO' || appointment.type === 'VIDEO') {
      const myPeerId = `appointment_${appointment.id}_${role.toLowerCase()}`
      const peer = new Peer(myPeerId)
      setPeerInstance(peer)

      peer.on('open', (id) => {
        console.log('PeerJS open with ID:', id)
        setCallStatus('Ready to connect')
      })

      peer.on('error', (err) => {
        console.error('PeerJS error:', err)
        setCallStatus(`Error: ${err.type}`)
      })

      peer.on('call', async (incomingCall) => {
        console.log('Answering incoming call from:', incomingCall.peer)
        try {
          const stream = await getLocalStream()
          incomingCall.answer(stream)
          setActiveCall(incomingCall)
          setCallStatus('Connected')

          incomingCall.on('stream', (remoteStream) => {
            attachRemoteStream(remoteStream)
          })

          incomingCall.on('close', () => {
            handleCallEnded()
          })
        } catch (err) {
          console.error("Failed to answer call:", err)
        }
      })
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect()
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [appointment.id, appointment.type, role])

  const getLocalStream = async () => {
    if (localStreamRef.current) return localStreamRef.current
    
    const constraints = {
      video: appointment.type === 'VIDEO',
      audio: true
    }
    const stream = await navigator.mediaDevices.getUserMedia(constraints)
    localStreamRef.current = stream

    if (appointment.type === 'VIDEO' && localVideoRef.current) {
      localVideoRef.current.srcObject = stream
    }
    return stream
  }

  const attachRemoteStream = (remoteStream) => {
    if (appointment.type === 'VIDEO' && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream
    } else if (appointment.type === 'AUDIO' && remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = remoteStream
    }
  }

  const handleStartCall = async () => {
    const targetPeerId = `appointment_${appointment.id}_${role === 'DOCTOR' ? 'patient' : 'doctor'}`
    setCallStatus('Calling...')
    try {
      const stream = await getLocalStream()
      const call = peerInstance.call(targetPeerId, stream)
      setActiveCall(call)

      call.on('stream', (remoteStream) => {
        attachRemoteStream(remoteStream)
        setCallStatus('Connected')
      })

      call.on('close', () => {
        handleCallEnded()
      })
      
      call.on('error', (err) => {
        console.error('Call error:', err)
        setCallStatus('Failed to connect')
      })
    } catch (err) {
      console.error("Failed to make call:", err)
      setCallStatus('Failed to get media devices')
    }
  }

  const handleEndCall = () => {
    if (activeCall) activeCall.close()
    handleCallEnded()
  }

  const handleCallEnded = () => {
    setActiveCall(null)
    setCallStatus('Call ended')
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null
    if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null
  }

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputText.trim()) return

    socketRef.current.emit('send_message', {
      appointmentId: appointment.id,
      senderId: user.user_id,
      senderRole: role,
      messageText: inputText,
      senderEmail: user.email
    })
    setInputText('')
  }

  return (
    <div className="consultation-area-container">
      {/* Header */}
      <div className="consultation-header">
        <div className="header-left">
          <button onClick={onBack} className="back-btn" aria-label="Return to Dashboard">
            <ArrowLeft size={16} />
            <span>Dashboard</span>
          </button>
          <div className="consultation-title-wrap">
            <span className="doc-name">Consultation with {role === 'DOCTOR' ? appointment.patientName : appointment.doctorName}</span>
            <span className="type-badge">{appointment.type}</span>
          </div>
        </div>
        <div className="consultation-header-actions">
          {role === 'PATIENT' && onRateDoctor && (
            <button 
              type="button" 
              className="rate-doc-header-btn"
              onClick={() => onRateDoctor(appointment)}
              title="Rate doctor consultation"
            >
              <Star size={14} className="star-icon filled" />
              <span>Rate Doctor</span>
            </button>
          )}
          {appointment.type !== 'MESSAGING' && (
            <span className="call-status-tag">Status: <strong>{callStatus}</strong></span>
          )}
        </div>
      </div>

      {/* Main body */}
      <div className="consultation-body">
        {/* Media Pane */}
        {appointment.type !== 'MESSAGING' && (
          <div className="media-pane">
            {appointment.type === 'VIDEO' ? (
              <div className="video-streams-wrap">
                {/* Remote Stream */}
                <div className="remote-stream-box">
                  <video ref={remoteVideoRef} autoPlay playsInline />
                  <span className="stream-label">
                    {role === 'DOCTOR' ? 'Patient' : 'Doctor'}
                  </span>
                </div>
                {/* Local Stream */}
                <div className="local-stream-box">
                  <video ref={localVideoRef} autoPlay playsInline muted />
                  <span className="stream-label">You</span>
                </div>
              </div>
            ) : (
              <div className="audio-call-box">
                <PhoneCall size={48} className="audio-icon" />
                <h3>Audio Consultation</h3>
                <audio ref={remoteAudioRef} autoPlay />
                <audio ref={localAudioRef} autoPlay muted />
              </div>
            )}

            {/* Media Controls */}
            <div className="media-controls-row">
              {!activeCall ? (
                <>
                  <button onClick={handleStartCall} className="primary-btn call-connect-btn">
                    <PhoneCall size={16} />
                    <span>Connect Call</span>
                  </button>
                  {role === 'PATIENT' && onRateDoctor && callStatus === 'Call ended' && (
                    <button 
                      type="button" 
                      onClick={() => onRateDoctor(appointment)} 
                      className="primary-btn rate-post-call-btn"
                    >
                      <Star size={15} />
                      <span>Rate Dr. {appointment.doctorName}</span>
                    </button>
                  )}
                </>
              ) : (
                <button onClick={handleEndCall} className="disconnect-btn">
                  <PhoneOff size={16} />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Chat Pane */}
        <div className="chat-pane">
          <div className="chat-pane-header">Clinical Chat Messages</div>
          
          {/* Messages list */}
          <div className="messages-list">
            {messages.map((msg, idx) => {
              const isMe = msg.sender_id === user.user_id;
              return (
                <div key={idx} className={`msg-item ${isMe ? 'mine' : 'theirs'}`}>
                  <div className="msg-sender">
                    {isMe ? 'You' : msg.User?.email || msg.sender_role}
                  </div>
                  <div className="msg-bubble">
                    {msg.message_text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="chat-form">
            <input
              type="text"
              placeholder="Type message to doctor..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button type="submit" className="primary-btn sm" aria-label="Send message">
              <Send size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ConsultationArea
