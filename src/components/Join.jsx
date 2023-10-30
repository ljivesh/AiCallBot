import { useCallback, useEffect, useState } from "react";
import styles from "../styles/Join.module.css";
import { useSocket } from "../providers/Socket";
import { useNavigate } from "react-router-dom";

const Join = () => {
  const { socket } = useSocket();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");

  const submissionHandler = (event) => {
    event.preventDefault();
    socket.emit("join-room", { emailId: email, roomId: roomId });
  };

  const handleJoinedRoom = useCallback(({ roomId }) => {
    navigate(`/room/${roomId}`);
  }, []);

  useEffect(() => {
    socket.on("joined-room", handleJoinedRoom);

    return () => {
      socket.off("joined-room", handleJoinedRoom);
    };
  }, [socket, handleJoinedRoom]);

  return (
    <form className={styles.joinRoomForm} onSubmit={submissionHandler}>
      <input
        placeholder="Enter Email"
        className={styles.emailInput}
        onInput={(e) => setEmail(e.target.value)}
      />
      <input
        placeholder="Enter RoomId"
        className={styles.roomIdInput}
        onInput={(e) => setRoomId(e.target.value)}
      />
      <button type="submit" className={styles.joinNowButton}>
        Join
      </button>
    </form>
  );
};

export default Join;
