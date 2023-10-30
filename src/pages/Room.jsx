import { useCallback, useEffect, useState } from "react";
import { usePeer } from "../providers/Peer";
import { useSocket } from "../providers/Socket";
import ReactPlayer from "react-player";

import styles from "../styles/Room.module.css";
import { useParams } from "react-router-dom";

const Room = () => {
  const { roomId } = useParams();

  const [buttonDisable, setButtonDisable] = useState(true);

  const { socket } = useSocket();
  const {
    peer,
    createOffer,
    createAnswer,
    setAnswer,
    sendStream,
    remoteStream,
    toggleVideoMute,
    toggleAudioMute
  } = usePeer();

  const [userStream, setUserStream] = useState(null);

  const [remoteEmailId, setRemoteEmailId] = useState("");

  const [track, setTrack] = useState({audio: true, video: true});

  console.log("Room ", peer.connectionState);


  const sendStreamButtonHandler = ()=> {
    sendStream(userStream);
    setButtonDisable(true);
  }

  const getUserStream = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    sendStream(stream);
    setUserStream(stream);
  }, []);

  const handleNewUserJoined = useCallback(
    async (data) => {
      const { emailId } = data;

      console.log(`User joined: ${emailId}`);

      setRemoteEmailId(emailId);

      const offer = await createOffer();
      console.log(`Sending Offer to ${emailId}`);
      console.log(offer);
      socket.emit("call-user", { emailId, offer });
    },
    [createOffer, socket]
  );

  const handleIncomingCall = useCallback(
    async (data) => {
      const { fromEmail, offer } = data;

      setRemoteEmailId(fromEmail);

      console.log(`Incoming call from ${fromEmail}: `);
      const answer = await createAnswer(offer);
      
      // sendStream(userStream);
      setButtonDisable(false);
      socket.emit("call-accept", { fromEmail, answer });
    },
    [socket, createAnswer]
  );

  const handleCallAccepted = useCallback(
    async (data) => {
      const { answer } = data;
      console.log("Call Accepted", answer);
      await setAnswer(answer);
      setButtonDisable(false);
      // sendStream(userStream);
    },
    [setAnswer]
  );

  const handleNegosiation = useCallback(async () => {
    // const localOffer = peer.localDescription;
    console.log("Opps!! Negotiation Needed");
    const localOffer = await createOffer();
    socket.emit("call-user", { emailId: remoteEmailId, offer: localOffer });
  }, [peer.localDescription, remoteEmailId, socket]);

  useEffect(() => {
    socket.on("user-joined", handleNewUserJoined);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("call-accepted", handleCallAccepted);

    return () => {
      socket.off("user-joined", handleNewUserJoined);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("call-accepted", handleCallAccepted);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall]);

  useEffect(() => {
    peer.addEventListener("negotiationneeded", handleNegosiation);

    return () => {
      peer.removeEventListener("negotiationneeded", handleNegosiation);
    };
  }, [peer, handleNegosiation]);

  useEffect(() => {
    getUserStream();
  }, [getUserStream]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        Chat Room Id:<span className={styles.roomId}>{roomId}</span>
      </h1>
      <div className={styles.players}>
        <ReactPlayer
          className={styles.userPlayer}
          url={userStream}
          playing
          muted
        />
        {remoteStream && <ReactPlayer
          className={styles.remotePlayer}
          url={remoteStream}
          playing
        />}
      </div>
      {remoteEmailId!=="" && (
        <h2 className={styles.connection}>
          You are now connected to:{" "}
          <span className={styles.connectionId}>{remoteEmailId}</span>
        </h2>
      )}
      <button
        className={`${styles.sendStreamButton} ${buttonDisable && styles.disabledButton}`}
        onClick={sendStreamButtonHandler}
        disabled={buttonDisable}
      >
        Enable Stream
      </button>
      <button
        className={styles.toggleVideo} 
        onClick={toggleVideoMute}
        >
          Toggle Video
        </button>
      <button
        className={styles.toggleVideo} 
        onClick={toggleAudioMute}
        >
          Toggle Audio
        </button>
      <button
        className={styles.toggleVideo} 
        onClick={()=> peer.close()}
        >
          End Call
        </button>
    </div>
  );
};

export default Room;
