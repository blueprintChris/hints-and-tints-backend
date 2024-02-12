import { Events } from '../constants/events';
import { Player } from '../models/Player';
import { Handler, Payload } from './types';

export default ({ io, socket, roomController }: Handler) => {
  const createRoom = ({ roomId }: Payload) => {
    roomController.createRoom(roomId, 10);

    socket.emit(Events.ROOM_CREATE, { roomId });

    console.log(`room created: ${roomId}`);
  };

  const joinRoom = ({ roomId, nickname }: RoomJoin) => {
    socket.join(roomId);

    const player = new Player(socket.id, nickname);
    socket.emit(Events.PLAYER_UPDATE, { player });

    roomController.joinRoom(roomId, player);
    const room = roomController.getRoomById(roomId);

    io.to(roomId).emit(Events.ROOM_JOIN, {
      roomId,
      players: room.getPlayers(),
      gameState: room.getState(),
    });

    console.log(`user ${nickname} joined room: ${roomId}`);
  };

  const roomSearch = ({ roomId }: Payload) => {
    const doesRoomExist = roomController.getRoomById(roomId);

    socket.emit(Events.ROOM_SEARCH, { doesRoomExist, roomId });

    console.log(`room search done on room: ${roomId}`);
  };

  const leaveRoom = () => {
    const socketRoom = [...socket.rooms];

    const playerId = socketRoom[0];
    const roomId = socketRoom[1];

    const room = roomController.getRoomById(roomId);

    if (room) {
      const player = room.getPlayerById(playerId);
      const players = roomController.leaveRoom(roomId, player);

      io.to(roomId).emit(Events.PLAYERS_UPDATE, { players });

      const isRoomEmpty = roomController.isRoomEmpty(roomId);

      if (isRoomEmpty) {
        roomController.deleteRoom(roomId);
      }
    }
  };

  socket.on(Events.DISCONNECTING, leaveRoom);
  socket.on(Events.ROOM_CREATE, createRoom);
  socket.on(Events.ROOM_JOIN, joinRoom);
  socket.on(Events.ROOM_SEARCH, roomSearch);
};

interface RoomJoin extends Payload {
  nickname: string;
}
