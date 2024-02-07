import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomController } from './controller/RoomController';
import { Player } from './models/Player';

export class Application {
  private roomController: RoomController;
  private port: number;

  constructor(port: number) {
    this.port = port;
  }

  public async start() {
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
      console.log(`server running at http://localhost:${this.port}`);
    });
  }

  private initSocket(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    io.on('connection', async socket => {
      console.log(`a user connected to the server`);

      const createRoom = ({ roomId }) => {
        this.roomController.createRoom(roomId);

        socket.emit('room-create', { roomId });
      };

      const joinRoom = ({ roomId, nickname }) => {
        socket.join(roomId);

        const player = new Player(socket.id, nickname);
        socket.emit('update-player', { player });

        const players = this.roomController.joinRoom(roomId, player);
        io.to(roomId).emit('room-join', { roomId, players });

        console.log(`user ${nickname} joined room: ${roomId}`);
      };

      const roomSearch = ({ roomId }) => {
        const doesRoomExist = this.roomController.getRoomById(roomId);

        socket.emit('room-search', { doesRoomExist, roomId });
      };

      const updatePlayerRole = ({ roomId, playerId, role }) => {
        const player = this.roomController.updatePlayerRole(roomId, playerId, role);
        socket.emit('update-player', { player });

        const players = this.roomController.getPlayers(roomId);
        io.to(roomId).emit('update-player-role', { players });

        console.log(`${player.getName()} updated their role to ${role}`);
      };

      const updateGameState = ({ roomId, gameState }) => {
        this.roomController.updateRoomState(roomId, gameState);

        io.to(roomId).emit('update-game-state', { gameState });
      };

      const disconnecting = () => {
        const socketRoom = [...socket.rooms];

        const playerId = socketRoom[0];
        const roomId = socketRoom[1];

        const room = this.roomController.getRoomById(roomId);

        if (room) {
          const player = room.getPlayerById(playerId);
          const players = this.roomController.leaveRoom(roomId, player);

          io.to(roomId).emit('room-leave', { players });

          const isRoomEmpty = this.roomController.isRoomEmpty(roomId);

          if (isRoomEmpty) {
            this.roomController.deleteRoom(roomId);
          }
        }
      };

      socket.on('room-create', createRoom);
      socket.on('room-join', joinRoom);
      socket.on('room-search', roomSearch);
      socket.on('update-player-role', updatePlayerRole);
      socket.on('update-game-state', updateGameState);
      socket.on('disconnecting', disconnecting);

      socket.on('disconnect', () => {
        console.log(`a user disconnected`);
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
