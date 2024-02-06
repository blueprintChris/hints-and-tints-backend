import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
});

app.get('/', (req, res) => {
  res.send('root');
});

io.on('connection', async socket => {
  console.log(`a user connected to the server`);

  socket.on('room-join', ({ roomId, nickname, playerList }) => {
    socket.join(roomId);

    console.log(playerList);
    io.to(roomId).emit('room-join', { roomId, playerList });

    console.log(`user ${nickname} joined room: ${roomId}`);
  });

  socket.on('room-search', ({ roomId }) => {
    const doesRoomExist = io.sockets.adapter.rooms.get(roomId);

    socket.emit('room-search', { doesRoomExist, roomId });
  });

  socket.on('disconnecting', () => {
    socket.on('room-leave', ({ roomId, nickname }) => {
      console.log(`user left room: ${roomId}`);
    });

    console.log('a user is disconnecting, rooms remaining:');
  });

  socket.on('disconnect', () => {
    console.log(`a user disconnected, rooms:`);
  });
});

server.listen(4000, () => {
  console.log('server running at http://localhost:4000');
});
