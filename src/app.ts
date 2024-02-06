import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomController } from './controller/RoomController';
import { Player } from './models/Player';

export class Application {
  private roomController: RoomController;

  constructor(private port: number) {
    this.bootstrap();
  }

  private async bootstrap() {
    const app = express();
    const server = createServer(app);

    const io = new Server(server, {
      cors: {
        origin: 'http://localhost:3000',
      },
    });

    this.roomController = new RoomController();

    this.initRoutes(app);
    this.initSocket(io);

    server.listen(this.port, () => {
      console.log('server running at http://localhost:4000');
    });
  }

  private initSocket(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    io.on('connection', async socket => {
      console.log(`a user connected to the server`);

      socket.on('room-create', ({ roomId }) => {
        this.roomController.createRoom(roomId);

        io.to(roomId).emit('room-create', { roomId });
      });

      socket.on('room-join', ({ roomId, nickname }) => {
        socket.join(roomId);

        const player = new Player(socket.id, nickname);

        this.roomController.joinRoom(roomId, player);

        const players = this.roomController.getPlayers(roomId);

        io.to(roomId).emit('room-join', { roomId, player, players });

        console.log(`user ${nickname} joined room: ${roomId}`);
      });

      socket.on('room-search', ({ roomId }) => {
        const doesRoomExist = this.roomController.getRoomById(roomId);

        io.emit('room-search', { doesRoomExist, roomId });
      });

      socket.on('disconnecting', () => {
        const socketRoom = [...socket.rooms];

        const playerId = socketRoom[0];
        const roomId = socketRoom[1];

        const room = this.roomController.getRoomById(roomId);

        if (room) {
          const player = room.getPlayerById(playerId);

          this.roomController.leaveRoom(roomId, player);
          const players = room.getPlayers();

          io.to(roomId).emit('room-leave', { players });

          const isRoomEmpty = this.roomController.isRoomEmpty(roomId);

          if (isRoomEmpty) {
            this.roomController.deleteRoom(roomId);
          }
        }
      });

      socket.on('disconnect', () => {
        console.log(`a user disconnected, rooms:`);
      });
    });
  }

  private initRoutes(app: Express) {
    app.get('/', (req, res) => {
      res.send('root');
    });

    app.get('/rooms', (req, res) => {
      const rooms = this.roomController.getRooms();

      res.send(rooms);
    });
  }
}
