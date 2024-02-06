import { Player } from '../models/Player';
import { Room } from '../models/Room';
import { RoomStore } from '../store/RoomStore';

export class RoomController {
  public roomStore: RoomStore;

  constructor() {
    this.roomStore = new RoomStore();
  }

  public getRooms() {
    return this.roomStore;
  }

  public getRoomById(id: string): Room {
    return this.roomStore.get(id);
  }

  public isRoomEmpty(id: string): boolean {
    return this.getRoomById(id).getPlayers().length === 0 ? true : false;
  }

  public createRoom(id: string): void {
    const room = new Room(id);

    this.roomStore.store(id, room);
  }

  public deleteRoom(id: string): void {
    this.roomStore.delete(id);
  }

  public joinRoom(roomId: string, player: Player): void {
    const room = this.getRoomById(roomId);

    room.addPlayer(player);
  }

  public leaveRoom(roomId: string, player: Player): void {
    const room = this.getRoomById(roomId);

    room.removePlayer(player);
  }

  public getPlayers(roomId: string): Player[] {
    const room = this.getRoomById(roomId);

    return room.getPlayers();
  }
}
