import { Player } from './Player';

export class Room {
  private id: string;
  private players: Player[];
  private turn: string;
  private hinter: string;

  constructor(id: string) {
    this.id = id;
    this.players = [];
    this.turn = '';
    this.hinter = '';
  }

  public addPlayer(player: Player) {
    this.players.push(player);
  }

  public removePlayer(player: Player): void {
    const playerIndex = this.players.indexOf(player);
    this.players.splice(playerIndex, 1);
  }

  public getPlayerById(id: string): Player {
    return this.players.find(p => p.getId() === id);
  }

  public getPlayers() {
    return this.players;
  }

  public getTurn() {
    return this.turn;
  }

  public getHinter() {
    return this.hinter;
  }

  public getId() {
    return this.id;
  }
}
