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
      console.log(`checking if player is already in a room`);

      const player =
        roomController.getPlayerById(roomId, playerId) ||
        roomController.getSpectatorById(roomId, playerId);

      if (!player) {
        console.log('player not found in room');
        socket.emit(Events.PLAYER_SEARCH, { isInRoom: false });
      } else {
        console.log(`player found: ${player.getName()}`);
        socket.emit(Events.PLAYER_SEARCH, { isInRoom: true });
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
