import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { SocketProvider } from "./providers/Socket.jsx";
import { PeerProvider } from "./providers/Peer.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  <SocketProvider>
    <PeerProvider>
      <App />
    </PeerProvider>
  </SocketProvider>
  // </React.StrictMode>
);
