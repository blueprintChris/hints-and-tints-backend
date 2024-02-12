import express, { Express } from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomController } from './controller/RoomController';
import registerRoomHandlers from './handlers/roomHandler';
import registerPlayerHandlers from './handlers/playerHandler';
import registerGameHandlers from './handlers/gameHandler';

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
    try {
      io.on('connection', async socket => {
        console.log(`a user connected to the server`);

        registerRoomHandlers({ io, socket, roomController: this.roomController });
        registerPlayerHandlers({ io, socket, roomController: this.roomController });
        registerGameHandlers({ io, socket, roomController: this.roomController });

        socket.on('error', err => {
          console.error('an error occurred', err.message);
        });

        socket.on('disconnect', () => {
          console.log(`a user disconnected`);
        });
      });
    } catch (err) {
      console.error('there was an error', err.message);
    }
  }

  private initRoutes(app: Express) {
    app.get('/', (_, res) => {
      res.send('root');
    });

    app.get('/rooms', (_, res) => {
      const rooms = this.roomController.getRooms();

      res.send(rooms);
    });

    app.get('/room/:roomId', (req, res) => {
      const rooms = this.roomController.getRoomById(req.params.roomId);

      res.send(rooms);
    });
  }
}
