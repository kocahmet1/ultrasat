import { useRef, useState, useCallback } from 'react';

/**
 * Hook for managing WebRTC connection to OpenAI Realtime API
 * Enables voice conversations with the AI Companion
 */
export function useRealtimeVoice() {
    const peerConnection = useRef(null);
    const localStream = useRef(null);
    const audioElement = useRef(null);

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState(null);
    const [isMuted, setIsMuted] = useState(false);

    /**
     * Disconnect from voice session
     */
    const disconnect = useCallback(() => {
        console.log('Disconnecting voice session');

        // Stop local audio tracks
        if (localStream.current) {
            localStream.current.getTracks().forEach(track => track.stop());
            localStream.current = null;
        }

        // Stop remote audio
        if (audioElement.current) {
            audioElement.current.srcObject = null;
        }

        // Close peer connection
        if (peerConnection.current) {
            peerConnection.current.close();
            peerConnection.current = null;
        }

        setIsConnected(false);
        setIsConnecting(false);
        setIsMuted(false);
    }, []);

    /**
     * Connect to OpenAI Realtime API using WebRTC
     * @param {string} ephemeralToken - Token from /api/companion/voice-token
     */
    const connect = useCallback(async (ephemeralToken) => {
        if (isConnected || isConnecting) {
            console.warn('Already connected or connecting');
            return false;
        }

        setIsConnecting(true);
        setError(null);

        try {
            // Create peer connection
            const pc = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            // Get microphone audio
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            localStream.current = stream;

            // Add local audio track to peer connection
            stream.getTracks().forEach(track => {
                pc.addTrack(track, stream);
            });

            // Handle incoming audio from AI
            pc.ontrack = (event) => {
                console.log('Received remote audio track');

                // Create or reuse audio element
                if (!audioElement.current) {
                    audioElement.current = new Audio();
                    audioElement.current.autoplay = true;
                }

                audioElement.current.srcObject = event.streams[0];
                audioElement.current.play().catch(err => {
                    console.warn('Audio autoplay blocked:', err);
                });
            };

            // Handle connection state changes
            pc.onconnectionstatechange = () => {
                console.log('Connection state:', pc.connectionState);
                if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
                    disconnect();
                }
            };

            // Create offer
            const offer = await pc.createOffer({
                offerToReceiveAudio: true
            });
            await pc.setLocalDescription(offer);

            // Wait for ICE gathering to complete
            await new Promise((resolve) => {
                if (pc.iceGatheringState === 'complete') {
                    resolve();
                } else {
                    pc.onicegatheringstatechange = () => {
                        if (pc.iceGatheringState === 'complete') {
                            resolve();
                        }
                    };
                    // Timeout after 5 seconds
                    setTimeout(resolve, 5000);
                }
            });

            // Send offer to OpenAI Realtime API
            const realtimeModel = 'gpt-realtime-mini-2025-12-15';
            const response = await fetch(
                `https://api.openai.com/v1/realtime?model=${realtimeModel}`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${ephemeralToken}`,
                        'Content-Type': 'application/sdp'
                    },
                    body: pc.localDescription.sdp
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Realtime API error: ${response.status} - ${errorText}`);
            }

            // Set remote description from API response
            const answerSdp = await response.text();
            await pc.setRemoteDescription({
                type: 'answer',
                sdp: answerSdp
            });

            peerConnection.current = pc;
            setIsConnected(true);
            setIsConnecting(false);

            console.log('Voice connection established');
            return true;

        } catch (err) {
            console.error('Voice connection error:', err);
            setError(err.message);
            setIsConnecting(false);

            // Cleanup on error
            if (localStream.current) {
                localStream.current.getTracks().forEach(track => track.stop());
                localStream.current = null;
            }

            return false;
        }
    }, [disconnect, isConnected, isConnecting]);

    /**
     * Toggle microphone mute
     */
    const toggleMute = useCallback(() => {
        if (localStream.current) {
            const audioTrack = localStream.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    }, []);

    return {
        // State
        isConnected,
        isConnecting,
        error,
        isMuted,

        // Actions
        connect,
        disconnect,
        toggleMute
    };
}

export default useRealtimeVoice;
