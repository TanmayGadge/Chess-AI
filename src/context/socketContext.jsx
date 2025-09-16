import { createContext, useContext, useState } from "react";

const SocketContext = createContext();

export const useSocket= () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  return (
    <SocketContext.Provider value={{ socket, setSocket }}>
      {children}
    </SocketContext.Provider>
  );
};
