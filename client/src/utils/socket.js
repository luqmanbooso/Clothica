import { io } from 'socket.io-client';

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8087';

let socket = null;

export const getSocket = () => {
  if (socket) return socket;
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    withCredentials: true
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

