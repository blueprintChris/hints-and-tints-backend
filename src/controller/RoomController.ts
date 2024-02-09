import { Colour } from '../models/Colour';
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
   * @param roomId room id
   * @param player player to add
   * @returns players
   */
  public joinRoom(roomId: string, player: Player): Player[] {
    const room = this.getRoomById(roomId);

    room.addPlayer(player);

    return room.getPlayers();
  }

  /**
   * Removes a player from a player list within a single room and returns updated player list
   * @param roomId room id
   * @param player player to remove
   * @returns players
   */
  public leaveRoom(roomId: string, player: Player): Player[] {
    const room = this.getRoomById(roomId);

    room.removePlayer(player);

    return room.getPlayers();
  }

  /**
   * Updates the player within the list of players with their new role
   * @param roomId room id
   * @param playerId player id
   * @param role hinter or tinter
   * @returns the updated player object
   */
  public setPlayerRole(roomId: string, playerId: string, role: string) {
    const room = this.getRoomById(roomId);

    const player = room.getPlayerById(playerId);

    player.setPlayerRole(role);

    return player;
  }

  public setRoomState(roomId: string, state: string) {
    const room = this.getRoomById(roomId);

    room.setState(state);
  }

  public setRoomHinter(roomId: string, playerId: string) {
    const room = this.getRoomById(roomId);

    room.setHinter(playerId);
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

  public getPlayerById(roomId: string, playerId: string) {
    const room = this.getRoomById(roomId);

    return room.getPlayerById(playerId);
  }

  /**
   * Sets new player list
   * @param roomId room id
   * @param players current list of players
   * @returns updated list of players
   */
  public setPlayers(roomId: string, players: Player[]) {
    const room = this.getRoomById(roomId);

    room.setPlayers(players);

    return room.getPlayers();
  }

  public getSelectedColour(roomId: string) {
    const room = this.getRoomById(roomId);

    return room.getSelectedColour();
  }

  public setSelectedColour(roomId: string, colour: Colour) {
    const room = this.getRoomById(roomId);

    room.setSelectedColour(colour);
  }

  public getCurrentTurn(roomId: string) {
    const room = this.getRoomById(roomId);

    return room.getCurrentTurn();
  }

  public setCurrentTurn(roomId: string, playerId: string) {
    const room = this.getRoomById(roomId);
    const player = room.getPlayerById(playerId);

    room.setCurrentTurn(player);
  }

  public setFirstHint(roomId: string, clue: string) {
    const room = this.getRoomById(roomId);

    room.setFirstHint(clue);
  }

  public setSecondHint(roomId: string, clue: string) {
    const room = this.getRoomById(roomId);

    room.setSecondHint(clue);
  }

  public setFirstTintForPlayer(roomId: string, playerId: string, colour: Colour) {
    const room = this.getRoomById(roomId);
    const player = room.getPlayerById(playerId);

    player.setFirstTint(colour);
  }

  public setSecondTintForPlayer(roomId: string, playerId: string, colour: Colour) {
    const room = this.getRoomById(roomId);
    const player = room.getPlayerById(playerId);

    player.setSecondTint(colour);
  }

  public resetAllGuesses(roomId: string) {
    const room = this.getRoomById(roomId);
    const players = room.getPlayers();

    players.forEach(player => {
      player.setFirstTint(null);
      player.setSecondTint(null);
    });
  }
}
