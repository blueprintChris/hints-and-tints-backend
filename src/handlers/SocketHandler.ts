import { Server, Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomController } from '../controller/RoomController';

export class SocketHandler {
  private socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
  private roomController: RoomController;

  constructor(
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
    roomController: RoomController
  ) {
    this.socket = socket;
    this.io = io;
    this.roomController = roomController;
  }

  public createRoom({ roomId }) {
    this.roomController.createRoom(roomId);

    this.socket.emit('room-create', { roomId });
  }
}
