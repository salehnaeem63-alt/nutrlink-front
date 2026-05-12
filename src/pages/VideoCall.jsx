import React, { useEffect, useRef, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import { AuthContext } from '../AuthContext';
import { markCompleted } from '../api/appointmetapi'; // Import your API function
import './VideoCall.css';
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  PhoneOff, 
  Settings,
  Monitor,
  MonitorOff
} from 'lucide-react';

const SOCKET_URL = 'http://localhost:5000';

const VideoCall = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Socket and WebRTC refs
  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const hasJoinedRef = useRef(false);

  // State
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteUser, setRemoteUser] = useState(null);
  const [callStatus, setCallStatus] = useState('Connecting...');
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState(null);
  
  // New state for completion modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);

  // Device selection
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState('');
  const [selectedVideoDevice, setSelectedVideoDevice] = useState('');

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // Get available media devices
  const getMediaDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');

      setAudioDevices(audioInputs);
      setVideoDevices(videoInputs);

      if (audioInputs.length > 0 && !selectedAudioDevice) {
        setSelectedAudioDevice(audioInputs[0].deviceId);
      }
      if (videoInputs.length > 0 && !selectedVideoDevice) {
        setSelectedVideoDevice(videoInputs[0].deviceId);
      }
    } catch (err) {
      console.error('Error getting media devices:', err);
    }
  };

  // Initialize local stream
  const initializeLocalStream = async (audioDeviceId, videoDeviceId) => {
    try {
      const constraints = {
        audio: audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true,
        video: videoDeviceId 
          ? { deviceId: { exact: videoDeviceId }, width: 1280, height: 720 } 
          : { width: 1280, height: 720 }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('🎥 Local stream obtained, video tracks:', stream.getVideoTracks().length);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      localStreamRef.current = stream;
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone. Please check permissions.');
      throw err;
    }
  };

  // Create peer connection
  const createPeerConnection = (targetSocketId) => {
    const peerConnection = new RTCPeerConnection(iceServers);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStreamRef.current);
      });
    }

    peerConnection.ontrack = (event) => {
      console.log('📺 Remote stream received');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && targetSocketId) {
        console.log('📡 Sending ICE candidate to', targetSocketId);
        socketRef.current.emit('ice-candidate', {
          to: targetSocketId,
          candidate: event.candidate
        });
      }
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('🔌 Connection state:', peerConnection.connectionState);
      if (peerConnection.connectionState === 'connected') {
        setCallStatus('Connected');
      } else if (peerConnection.connectionState === 'failed') {
        setCallStatus('Connection failed');
      }
    };

    return peerConnection;
  };

  // Create and send offer
  const createOffer = async (socketId) => {
    try {
      const peerConnection = createPeerConnection(socketId);
      peerConnectionRef.current = peerConnection;

      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      socketRef.current.emit('offer', {
        to: socketId,
        offer: peerConnection.localDescription
      });
    } catch (err) {
      console.error('Error creating offer:', err);
    }
  };

  // Handle incoming offer
  const handleOffer = async ({ from, offer }) => {
    try {
      const peerConnection = createPeerConnection(from);
      peerConnectionRef.current = peerConnection;

      await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      socketRef.current.emit('answer', {
        to: from,
        answer: peerConnection.localDescription
      });
    } catch (err) {
      console.error('Error handling offer:', err);
    }
  };

  // Handle incoming answer
  const handleAnswer = async ({ answer }) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    } catch (err) {
      console.error('Error handling answer:', err);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async ({ candidate }) => {
    try {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    } catch (err) {
      console.error('Error handling ICE candidate:', err);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        
        if (socketRef.current) {
          socketRef.current.emit('toggle-mic', {
            roomId: appointmentId,
            enabled: audioTrack.enabled
          });
        }
      }
    }
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        
        if (socketRef.current) {
          socketRef.current.emit('toggle-camera', {
            roomId: appointmentId,
            enabled: videoTrack.enabled
          });
        }
      }
    }
  };

  // Screen sharing
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true
        });

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = peerConnectionRef.current
          ?.getSenders()
          .find(s => s.track?.kind === 'video');

        if (sender) {
          sender.replaceTrack(screenTrack);
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }

        screenTrack.onended = () => {
          stopScreenShare();
        };

        setIsScreenSharing(true);
      } else {
        stopScreenShare();
      }
    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const stopScreenShare = () => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerConnectionRef.current
      ?.getSenders()
      .find(s => s.track?.kind === 'video');

    if (sender && videoTrack) {
      sender.replaceTrack(videoTrack);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    setIsScreenSharing(false);
  };

  // Change audio device
  const changeAudioDevice = async (deviceId) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: false
      });

      const newAudioTrack = newStream.getAudioTracks()[0];
      const sender = peerConnectionRef.current
        ?.getSenders()
        .find(s => s.track?.kind === 'audio');

      if (sender) {
        sender.replaceTrack(newAudioTrack);
      }

      const oldAudioTrack = localStreamRef.current?.getAudioTracks()[0];
      if (oldAudioTrack) {
        oldAudioTrack.stop();
        localStreamRef.current.removeTrack(oldAudioTrack);
        localStreamRef.current.addTrack(newAudioTrack);
      }

      setSelectedAudioDevice(deviceId);
    } catch (err) {
      console.error('Error changing audio device:', err);
    }
  };

  // Change video device
  const changeVideoDevice = async (deviceId) => {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { deviceId: { exact: deviceId }, width: 1280, height: 720 }
      });

      const newVideoTrack = newStream.getVideoTracks()[0];
      const sender = peerConnectionRef.current
        ?.getSenders()
        .find(s => s.track?.kind === 'video');

      if (sender) {
        sender.replaceTrack(newVideoTrack);
      }

      const oldVideoTrack = localStreamRef.current?.getVideoTracks()[0];
      if (oldVideoTrack) {
        oldVideoTrack.stop();
        localStreamRef.current.removeTrack(oldVideoTrack);
        localStreamRef.current.addTrack(newVideoTrack);
      }

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStreamRef.current;
      }

      setSelectedVideoDevice(deviceId);
    } catch (err) {
      console.error('Error changing video device:', err);
    }
  };

  // Cleanup call resources
  const cleanupCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId: appointmentId });
      socketRef.current.disconnect();
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
  };

  // End call - Updated to show modal for nutritionists
  const endCall = () => {
    cleanupCall();

    // Check if user is a nutritionist (adjust this condition based on your user object structure)
    if (user?.role === 'nutritionist' || user?.isNutritionist) {
      setShowCompletionModal(true);
    } else {
      navigate(-1);
    }
  };

  // Handle marking appointment as complete
  const handleMarkComplete = async () => {
    setIsMarkingComplete(true);
    try {
      await markCompleted(appointmentId);
      console.log('Appointment marked as completed');
      setShowCompletionModal(false);
      navigate(-1);
    } catch (error) {
      console.error('Error marking appointment as complete:', error);
      alert('Failed to mark appointment as complete. Please try again.');
      setIsMarkingComplete(false);
    }
  };

  // Handle skipping completion
  const handleSkipCompletion = () => {
    setShowCompletionModal(false);
    navigate(-1);
  };

  // Initialize
  useEffect(() => {
    const init = async () => {
      try {
        await getMediaDevices();
        await initializeLocalStream(selectedAudioDevice, selectedVideoDevice);

        socketRef.current = io(SOCKET_URL);

        socketRef.current.on('connect', () => {
          console.log('Socket connected:', socketRef.current.id);
          
          if (!hasJoinedRef.current) {
            hasJoinedRef.current = true;
            socketRef.current.emit('join-room', {
              roomId: appointmentId,
              userId: user._id,
              username: user.username
            });
          }
        });

        socketRef.current.on('room-users', ({ participants }) => {
          if (participants.length > 0) {
            setRemoteUser(participants[0]);
            createOffer(participants[0].socketId);
          }
        });

        socketRef.current.on('user-joined', ({ socketId, username, userId }) => {
          setRemoteUser({ socketId, username, userId });
          setCallStatus('User joined');
        });

        socketRef.current.on('call-ready', () => {
          setCallStatus('Call ready');
        });

        socketRef.current.on('offer', handleOffer);
        socketRef.current.on('answer', handleAnswer);
        socketRef.current.on('ice-candidate', handleIceCandidate);

        socketRef.current.on('user-left', () => {
          setCallStatus('User left the call');
          setRemoteUser(null);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
          }
        });

        socketRef.current.on('call-ended', () => {
          setCallStatus('Call ended');
        });

        socketRef.current.on('room-id-missing', () => {
          setError('Room ID is missing');
        });

        socketRef.current.on('invalid-room', ({ message }) => {
          setError(message);
        });

        socketRef.current.on('not-authorized', ({ message }) => {
          setError(message);
        });

        socketRef.current.on('room-full', ({ message }) => {
          setError(message);
        });

        socketRef.current.on('already-joined', ({ message }) => {
          setError(message);
        });

        socketRef.current.on('server-error', ({ message }) => {
          setError(message);
        });

      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize call');
      }
    };

    init();

    return () => {
      hasJoinedRef.current = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
    };
  }, []);

  if (error) {
    return (
      <div className="video-call-error">
        <div className="error-content">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="video-call-container">
      {/* Call status */}
      <div className="call-status">
        <span className="status-dot"></span>
        {callStatus}
      </div>

      {/* Video grid */}
      <div className="video-grid">
        {/* Remote video */}
        <div className="video-wrapper remote-video-wrapper">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="video-element"
          />
          {remoteUser && (
            <div className="video-label">{remoteUser.username}</div>
          )}
          {!remoteUser && (
            <div className="waiting-message">
              Waiting for the other participant...
            </div>
          )}
        </div>

        {/* Local video */}
        <div className="video-wrapper local-video-wrapper">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
          />
          <div className="video-label">You</div>
        </div>
      </div>

      {/* Controls */}
      <div className="call-controls">
        <button
          className={`control-btn ${!isAudioEnabled ? 'disabled' : ''}`}
          onClick={toggleAudio}
          title={isAudioEnabled ? 'Mute' : 'Unmute'}
        >
          {isAudioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
        </button>

        <button
          className={`control-btn ${!isVideoEnabled ? 'disabled' : ''}`}
          onClick={toggleVideo}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
        </button>

        <button
          className={`control-btn ${isScreenSharing ? 'active' : ''}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {isScreenSharing ? <MonitorOff size={24} /> : <Monitor size={24} />}
        </button>

        <button
          className="control-btn settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          title="Settings"
        >
          <Settings size={24} />
        </button>

        <button
          className="control-btn end-call-btn"
          onClick={endCall}
          title="End call"
        >
          <PhoneOff size={24} />
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="settings-panel">
          <h3>Device Settings</h3>
          
          <div className="setting-group">
            <label>Microphone</label>
            <select
              value={selectedAudioDevice}
              onChange={(e) => changeAudioDevice(e.target.value)}
            >
              {audioDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="setting-group">
            <label>Camera</label>
            <select
              value={selectedVideoDevice}
              onChange={(e) => changeVideoDevice(e.target.value)}
            >
              {videoDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Camera ${device.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="close-settings-btn"
            onClick={() => setShowSettings(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="completion-modal-overlay">
          <div className="completion-modal">
            <h2>Mark Appointment Complete?</h2>
            <p>Would you like to mark this appointment as completed?</p>
            
            <div className="completion-modal-actions">
              <button
                className="btn-complete"
                onClick={handleMarkComplete}
                disabled={isMarkingComplete}
              >
                {isMarkingComplete ? 'Marking Complete...' : 'Yes, Mark Complete'}
              </button>
              <button
                className="btn-skip"
                onClick={handleSkipCompletion}
                disabled={isMarkingComplete}
              >
                No, Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;