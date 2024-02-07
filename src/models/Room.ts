import { Player } from './Player';

export class Room {
  private id: string;
  private players: Player[];
  private currentTurn: string;
  private hinter: string;
  private state: string;

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.currentTurn = '';
    this.hinter = '';
    this.state = 'LOBBY';
  }

  public getPlayers() {
    return this.players;
  }

  public getPlayerById(id: string): Player {
    return this.players.find(p => p.getId() === id);
  }

  public getTurn() {
    return this.currentTurn;
  }

  public getHinter() {
    return this.hinter;
  }

  public getId() {
    return this.id;
  }

  public getState() {
    return this.state;
  }

  public addPlayer(player: Player) {
    this.players.push(player);
  }

  public removePlayer(player: Player): void {
    const playerIndex = this.players.indexOf(player);

    this.players.splice(playerIndex, 1);
  }

  public setState(state: string) {
    this.state = state;
  }

  public setHinter(playerId: string) {
    this.hinter = playerId;
  }
}
