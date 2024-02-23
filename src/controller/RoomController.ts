import { TINTER } from '../constants/roles';
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
    return this.getRoomById(id).getAllPlayers().length === 0 ? true : false;
  }

  /**
   * Creates an new empty room at specified object key
   * @param id room id
   * @param scoreLimit game ends when this score is reached
   */
  public createRoom(id: string, scoreLimit: number): void {
    const room = new Room(id, scoreLimit);

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
   * Joins a room in session as a spectator and returns an updated player list
   * @param roomId room id
   * @param player player to add
   * @returns players
   */
  public joinRoom(roomId: string, player: Player): void {
    const room = this.getRoomById(roomId);

    room.addSpectator(player);
  }

  /**
   * Removes a player from a player list within a single room and returns updated player list
   * @param roomId room id
   * @param player player to remove
   * @returns players
   */
  public leaveRoom(roomId: string, player: Player): void {
    const room = this.getRoomById(roomId);

    room.removeSpectator(player);
  }

  /**
   * Joins a game in session and returns an updated player list
   * @param roomId room id
   * @param player player to add
   * @returns players
   */
  public joinGame(roomId: string, player: Player): void {
    const room = this.getRoomById(roomId);

    room.addPlayer(player);
    room.removeSpectator(player);
  }

  /**
   * Removes a player from a player list within a single room and returns updated player list
   * @param roomId room id
   * @param player player to remove
   * @returns players
   */
  public leaveGame(roomId: string, player: Player): void {
    const room = this.getRoomById(roomId);

    room.removePlayer(player);
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
  }

  public setRoomState(roomId: string, state: string) {
    const room = this.getRoomById(roomId);

    room.setState(state);
  }

  public setRoomHinter(roomId: string, hinter: Player) {
    const room = this.getRoomById(roomId);

    room.setHinter(hinter);
  }

  /**
   * Gets the full list of players for a single room
   * @param roomId room id
   * @returns Player list
   */
  public getAllPlayers(roomId: string): Player[] {
    const room = this.getRoomById(roomId);

    return room.getAllPlayers();
  }

  public getPlayerById(roomId: string, playerId: string) {
    const room = this.getRoomById(roomId);

    return room.getPlayerById(playerId);
  }

  public getAllSpectators(roomId: string): Player[] {
    const room = this.getRoomById(roomId);

    return room.getAllSpectators();
  }

  public getSpectatorById(roomId: string, playerId: string) {
    const room = this.getRoomById(roomId);

    return room.getSpectatorById(playerId);
  }

  public getPlayerBySocketId(roomId: string, socketId: string) {
    const room = this.getRoomById(roomId);

    return room.getPlayerBySocketId(socketId);
  }

  public getGameState(roomId: string) {
    const room = this.getRoomById(roomId);

    return room.getState();
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

  public getHinter(roomId: string) {
    const room = this.getRoomById(roomId);
    const hinter = room.getAllPlayers()[0];

    return hinter;
  }

  public setWinner(roomId: string, player: Player) {
    const room = this.getRoomById(roomId);

    room.setWinner(player);
  }

  public getWinner(roomId: string) {
    const room = this.getRoomById(roomId);

    return room.getWinner();
  }

  public getScoreLimit(roomId: string) {
    const room = this.getRoomById(roomId);

    return room.getScoreLimit();
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
    const players = room.getAllPlayers();

    players.forEach(player => {
      player.setFirstTint(null);
      player.setSecondTint(null);
    });
  }

  public resetAllScores(roomId: string) {
    const room = this.getRoomById(roomId);
    const players = room.getAllPlayers();

    players.forEach(player => {
      player.setScore(0);
      player.setPrevScore(0);
    });
  }

  public determineWinner(roomId: string) {
    const room = this.getRoomById(roomId);
    const players = room.getAllPlayers();

    const winningPlayers = players.filter(player => player.getScore() >= room.getScoreLimit());

    if (winningPlayers.length === 0) return null;

    let winningPlayer = winningPlayers[0];

    winningPlayers.forEach(player => {
      if (player.getScore() > winningPlayer.getScore()) {
        winningPlayer = player;
      }
    });

    room.setWinner(winningPlayer);
  }

  public updateScores(
    roomId: string,
    players: Player[],
    innerSquares: Colour[],
    outerSquares: Colour[]
  ) {
    const room = this.getRoomById(roomId);
    const hinter = this.getHinter(roomId);

    // we will check if anyone got the correct colour
    players.forEach(player => {
      // first we need to store the previous score
      player.setPrevScore(player.getScore());

      if (player.getRole() === TINTER) {
        if (player.getFirstTint().getRef() === room.getSelectedColour().getRef()) {
          // 3 points for guessing the exact colour
          player.setScore(player.getScore() + 3);

          // hinter gets 1 point per guess inside scoring square
          hinter.setScore(hinter.getScore() + 1);
        }

        if (player.getSecondTint().getRef() === room.getSelectedColour().getRef()) {
          // 3 points for guessing the exact colour
          player.setScore(player.getScore() + 3);
          // hinter gets 1 point per guess inside scoring square
          hinter.setScore(hinter.getScore() + 1);
        }

        // check for inner surrounding squares, score by 2
        innerSquares.forEach(square => {
          if (square) {
            if (player.getFirstTint().getRef() === square.getRef()) {
              // 2 points for guessing the spaces inside the scoring square
              player.setScore(player.getScore() + 2);
              // hinter gets 1 point per guess inside scoring square
              hinter.setScore(hinter.getScore() + 1);
            }

            if (player.getSecondTint().getRef() === square.getRef()) {
              // 2 points for guessing the spaces inside the scoring square
              player.setScore(player.getScore() + 2);
              // hinter gets 1 point per guess inside scoring square
              hinter.setScore(hinter.getScore() + 1);
            }
          }
        });

        // check for outer surrounding squares, score by 1 - hinter gets no points for these
        outerSquares.forEach(square => {
          if (square) {
            if (player.getFirstTint().getRef() === square.getRef()) {
              // 1 points for guessing the spaces outside the scoring square
              player.setScore(player.getScore() + 1);
            }

            if (player.getSecondTint().getRef() === square.getRef()) {
              // 1 points for guessing the spaces outside the scoring square
              player.setScore(player.getScore() + 1);
            }
          }
        });
      }
    });
  }
}
