import { Events } from '../constants/events';
import { Player } from '../models/Player';
import { Handler, Payload } from './types';

export default ({ io, socket, roomController }: Handler) => {
  const createRoom = ({ roomId }: RoomCreate) => {
    try {
      roomController.createRoom(roomId, 50);

      socket.emit(Events.ROOM_CREATE, { roomId });

      console.log(`room created: ${roomId}`);
    } catch (err) {
      console.error(`error creating room: ${err.message}`);
    }
  };

  const getRoom = ({ roomId, playerId }) => {
    try {
      socket.join(roomId);

      const room = roomController.getRoomById(roomId);
      const player =
        roomController.getSpectatorById(roomId, playerId) ||
        roomController.getPlayerById(roomId, playerId);

      socket.emit(Events.ROOM_GET, {
        isInRoom: true,
        player,
        players: room.getAllPlayers(),
        spectators: room.getAllSpectators(),
        gameState: room.getState(),
        scoreLimit: room.getScoreLimit(),
        currentTurn: room.getCurrentTurn(),
        selectedColour: room.getSelectedColour(),
        firstHint: room.getFirstHint(),
        secondHint: room.getSecondHint(),
        winner: room.getWinner(),
      });
    } catch (err) {
      console.error(`error getting room data: ${err.message}`);
    }
  };

  const joinRoom = ({ roomId, nickname, playerId }: RoomJoin) => {
    try {
      socket.join(roomId);

      const room = roomController.getRoomById(roomId);
      const player = new Player(playerId, nickname, socket.id, room.isEmpty());

      socket.emit(Events.PLAYER_UPDATE, { player });

      roomController.joinRoom(roomId, player);

      io.to(roomId).emit(Events.ROOM_JOIN, {
        roomId,
        players: room.getAllPlayers(),
        spectators: room.getAllSpectators(),
        gameState: room.getState(),
        scoreLimit: room.getScoreLimit(),
      });

      console.log(`user ${nickname} joined room: ${roomId}`);
    } catch (err) {
      console.error(`error joining room: ${err.message}`);
    }
  };

  const updateRoom = ({ roomId, scoreLimit }) => {
    try {
      const room = roomController.getRoomById(roomId);
      room.setScoreLimit(scoreLimit);

      io.to(roomId).emit(Events.ROOM_UPDATE, { scoreLimit: room.getScoreLimit() });
    } catch (err) {
      console.error(`error updating score for room: ${err.message}`);
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
  socket.on(Events.ROOM_UPDATE, updateRoom);
  socket.on(Events.ROOM_SEARCH, roomSearch);
  socket.on(Events.ROOM_GET, getRoom);
};

interface RoomJoin extends Payload {
  nickname: string;
  playerId: string;
}

interface RoomCreate extends Payload {
  scoreLimit: number;
}
