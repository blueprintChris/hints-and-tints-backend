import { Events } from '../constants/events';
import { Player } from '../models/Player';
import { Handler, Payload } from './types';

export default ({ io, socket, roomController }: Handler) => {
  const updatePlayerRole = ({ roomId, playerId, role }: PlayerRoleUpdate) => {
    try {
      roomController.setPlayerRole(roomId, playerId, role);

      const player = roomController.getPlayerById(roomId, playerId);
      socket.emit(Events.PLAYER_UPDATE, { player });

      const players = roomController.getAllPlayers(roomId);
      io.to(roomId).emit(Events.PLAYERS_UPDATE, { players });

      console.log(`${player.getName()} updated their role to ${role}`);
    } catch (err) {
      console.error(`error updating player role: ${err.message}`);
    }
  };

  const handlePlayerSearch = ({ roomId, playerId }: PlayerSearch) => {
    try {
      const player = roomController.getPlayerById(roomId, playerId);

      if (player) {
        const room = roomController.getRoomById(roomId);
        socket.join(roomId);

        player.setSocketId(socket.id);

        socket.emit(Events.PLAYER_SEARCH, {
          player,
          players: room.getAllPlayers(),
          gameState: room.getState(),
          scoreLimit: room.getScoreLimit(),
          currentTurn: room.getCurrentTurn(),
          selectedColour: room.getSelectedColour(),
          firstHint: room.getFirstHint(),
          secondHint: room.getSecondHint(),
          winner: room.getWinner(),
        });

        console.log(`${player.getName()} re-joined the game`);
      }
    } catch (err) {
      console.error(`error searching for player room: ${err.message}`);
    }
  };

  socket.on(Events.PLAYER_UPDATE_ROLE, updatePlayerRole);
  socket.on(Events.PLAYER_SEARCH, handlePlayerSearch);
};

interface PlayerRoleUpdate extends Payload {
  playerId: string;
  role: string;
}

interface PlayerSearch extends Payload {
  playerId: string;
  nickname: string;
}
