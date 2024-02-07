import { Player } from '../models/Player';
import { Room } from '../models/Room';
import { RoomStore } from '../store/RoomStore';

export class RoomController {
  public roomStore: RoomStore;

  constructor() {
    this.roomStore = new RoomStore();
  }

  /**
   * Gets all rooms
   * @returns all rooms
   */
  public getRooms() {
    return this.roomStore;
  }

  /**
   * Gets a single room by id
   * @param id room id
   * @returns Room
   */
  public getRoomById(id: string): Room {
    return this.roomStore.get(id);
  }

  /**
   * Checks a rooms player count
   * @param id room id
   * @returns true if player count is zero, false otherwise
   */
  public isRoomEmpty(id: string): boolean {
    return this.getRoomById(id).getPlayers().length === 0 ? true : false;
  }

  /**
   * Creates an new empty room at specified object key
   * @param id room id
   */
  public createRoom(id: string): void {
    const room = new Room(id);

    this.roomStore.store(id, room);
  }

  /**
   * Deletes the room key, remvoing it from the store object
   * @param id room id
   */
  public deleteRoom(id: string): void {
    this.roomStore.delete(id);
  }

  /**
   * Joins a room in session and returns an updated player list
   */
  public joinRoom(roomId: string, player: Player): Player[] {
    const room = this.getRoomById(roomId);

    room.addPlayer(player);

    return room.getPlayers();
  }

  /**
   * Removes a player from a player list within a single room
   * @param roomId room id
   * @param player player to remove
   */
  public leaveRoom(roomId: string, player: Player): void {
    const room = this.getRoomById(roomId);

    room.removePlayer(player);
  }

  /**
   * Gets the full list of players for a single room
   * @param roomId room id
   * @returns Player list
   */
  public getPlayers(roomId: string): Player[] {
    const room = this.getRoomById(roomId);

    return room.getPlayers();
  }
}
