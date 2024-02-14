import { Events } from '../constants/events';
import { Player } from '../models/Player';
import { Handler, Payload } from './types';

export default ({ io, socket, roomController }: Handler) => {
  const createRoom = ({ roomId, scoreLimit }: RoomCreate) => {
    try {
      roomController.createRoom(roomId, scoreLimit);

      socket.emit(Events.ROOM_CREATE, { roomId });

      console.log(`room created: ${roomId}`);
    } catch (err) {
      console.error(`error creating room: ${err.message}`);
    }
  };

  const joinRoom = ({ roomId, nickname, playerId }: RoomJoin) => {
    try {
      socket.join(roomId);

      const player = new Player(playerId, nickname, socket.id);
      socket.emit(Events.PLAYER_UPDATE, { player });

      roomController.joinRoom(roomId, player);
      const room = roomController.getRoomById(roomId);

      io.to(roomId).emit(Events.ROOM_JOIN, {
        roomId,
        players: room.getAllPlayers(),
        gameState: room.getState(),
        scoreLimit: room.getScoreLimit(),
      });

      console.log(`user ${nickname} joined room: ${roomId}`);
    } catch (err) {
      console.error(`error joining room: ${err.message}`);
    }
  };

  const roomSearch = ({ roomId }: Payload) => {
    try {
      const doesRoomExist = roomController.getRoomById(roomId);

      socket.emit(Events.ROOM_SEARCH, { doesRoomExist, roomId });

      console.log(`room search done on room: ${roomId}`);
    } catch (err) {
      console.error(`error searching for room: ${err.message}`);
    }
  };

  socket.on(Events.ROOM_CREATE, createRoom);
  socket.on(Events.ROOM_JOIN, joinRoom);
  socket.on(Events.ROOM_SEARCH, roomSearch);
};

interface RoomJoin extends Payload {
  nickname: string;
  playerId: string;
}

interface RoomCreate extends Payload {
  scoreLimit: number;
}
