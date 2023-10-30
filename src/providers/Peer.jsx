import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const PeerContext = createContext(null);
export const usePeer = () => useContext(PeerContext);

export const PeerProvider = (props) => {
  const [remoteStream, setRemoteStream] = useState(null);

  const [isAudioMuted, setAudioMuted] = useState(false);
  const [isVideoMuted, setVideoMuted] = useState(false);

  const toggleAudioMute = () => {
    const audioTracks = peer.getSenders().find((sender) => sender.track.kind === 'audio').track;
    audioTracks.enabled = !isAudioMuted;
    setAudioMuted(!isAudioMuted);
  };
  
  const toggleVideoMute = () => {
    const videoTracks = peer.getSenders().find((sender) => sender.track.kind === 'video').track;
    videoTracks.enabled = !isVideoMuted;
    setVideoMuted(!isVideoMuted);
  };
  

  const peer = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              "stun:stun.l.google.com:19302",
              "stun:global.stun.twilio.com:3478",
            ],
          },
        ],
      }),
    []
  );

  const createOffer = async () => {
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    return offer;
  };

  const createAnswer = async (offer) => {
    await peer.setRemoteDescription(offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    return answer;
  };

  const setAnswer = async (answer) => {
    await peer.setRemoteDescription(answer);
  };

  const sendStream = async (stream) => {
    const tracks = stream.getTracks();
    console.log("Triggered SendStream", tracks);
    for (const track of tracks) {
      peer.addTrack(track, stream);
    }
  };

  const handleTrackEvent = useCallback(
    (event) => {
      const streams = event.streams;
      console.log("Triggeredddd");
      setRemoteStream(streams[0]);
    },
    [setRemoteStream]
  );

  useEffect(() => {
    peer.addEventListener("track", handleTrackEvent);

    return () => {
      peer.removeEventListener("track", handleTrackEvent);
    };
  }, [peer, handleTrackEvent]);

  return (
    <PeerContext.Provider
      value={{
        peer,
        createOffer,
        createAnswer,
        setAnswer,
        sendStream,
        remoteStream,
        toggleAudioMute,
        toggleVideoMute,
      }}
    >
      {props.children}
    </PeerContext.Provider>
  );
};
