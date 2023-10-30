import {createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);
export const useSocket = ()=> useContext(SocketContext);

export const SocketProvider = (props) => {
  const socket = useMemo(
    () =>
      io('ws://localhost:8001'),
    []
  );


  // console.log(socket);

  return (
    <SocketContext.Provider value={{socket}}>
      {props.children}
    </SocketContext.Provider>
  );
};
