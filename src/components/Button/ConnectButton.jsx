import React from 'react'

import { useSocket } from '../../context/socketContext';

const ConnectButton = () => {

  const { socket, setSocket } = useSocket();

  return (
    <button
      className=" top-10 right-10 p-2 rounded-lg bg-white"
      onClick={() => {
        setSocket(new WebSocket("ws://localhost:8080"));
      }}
    >
      Connect
    </button>
  )
}

export default ConnectButton