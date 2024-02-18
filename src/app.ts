import express, { Express } from 'express';
import fs from 'fs';
import path from 'path';
import { createServer } from 'node:http';
import https from 'node:https';
import { Server } from 'socket.io';
import schedule from 'node-schedule';
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
    this.roomController = new RoomController();
  }

  public async start() {
    const app = express();
    const server = createServer(app);

    const io = new Server(server, {
      cors: {
        origin: '*',
      },
    });

    this.initRoutes(app);
    this.authSocket(io);
    this.initSocket(io);

    schedule.scheduleJob({ hour: 0, minute: 0 }, this.deleteStaleRooms);

    server.listen(this.port, () => {
      console.log(`server listening on port: ${this.port}`);
    });
  }

  private deleteStaleRooms = (): void => {
    try {
      console.log('stale room scheduler triggered');
      const rooms = this.roomController.getRooms();
      const now = new Date();

      Object.keys(rooms.rooms).map(roomId => {
        if (now.getTime() - rooms.rooms[roomId].getCreated().getTime() / 3600000 >= 24) {
          console.log(`room ${roomId} is stale, deleting...`);
          this.roomController.deleteRoom(roomId);
        }
      });
    } catch (err) {
      console.log(`error deleting stale rooms: ${err.message}`);
    }
  };

  private authSocket(io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>) {
    io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (token !== process.env.SOCKET_KEY) {
        const err = new Error('Not authorised!!');
        console.log(`Not Authorised: ${err.message}`);

        next(err);
      } else {
        console.log('auth accepted');
        next();
      }
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

        socket.on('connect_error', err => {
          console.error('an error occurred', err.message);
        });

        socket.on('disconnect', () => {
          console.log('a user disconnected');
        });
      });
    } catch (err) {
      console.error('there was an error', err.message);
    }
  }

  private initRoutes(app: Express) {
    app.get('/v1', (_, res) => {
      res.send('root');
    });

    app.get('/v1/rooms', (_, res) => {
      const rooms = this.roomController.getRooms();

      res.send(rooms);
    });

    app.get('/v1/room/:roomId', (req, res) => {
      const rooms = this.roomController.getRoomById(req.params.roomId);

      res.send(rooms);
    });

    app.get('/v1/health', (req, res) => {
      res.status(200).send('ok');
    });
  }
}
