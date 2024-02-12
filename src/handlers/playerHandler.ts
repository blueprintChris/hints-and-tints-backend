import { Events } from '../constants/events';
import { Handler, Payload } from './types';

export default ({ io, socket, roomController }: Handler) => {
  const updatePlayerRole = ({ roomId, playerId, role }: PlayerRoleUpdate) => {
    roomController.setPlayerRole(roomId, playerId, role);

    const player = roomController.getPlayerById(roomId, playerId);
    socket.emit(Events.PLAYER_UPDATE, { player });

    const players = roomController.getPlayers(roomId);
    io.to(roomId).emit(Events.PLAYERS_UPDATE, { players });

    console.log(`${player.getName()} updated their role to ${role}`);
  };

  socket.on(Events.PLAYER_UPDATE_ROLE, updatePlayerRole);
};

interface PlayerRoleUpdate extends Payload {
  playerId: string;
  role: string;
}
