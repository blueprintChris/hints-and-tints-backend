import { Colour } from './Colour';
import { Player } from './Player';

export class Room {
  private id: string;
  private players: Player[];
  private currentTurn: Player;
  private hinter: Player;
  private state: string;
  private selectedColour: Colour;
  private firstHint: string;
  private secondHint: string;
  private roundNumber: number;
  private scoreLimit: number;
  private winner: Player;

  constructor(id: string, scoreLimit: number) {
    this.id = id;
    this.players = [];
    this.currentTurn = null;
    this.hinter = null;
    this.state = 'LOBBY';
    this.selectedColour = null;
    this.firstHint = '';
    this.secondHint = '';
    this.roundNumber = 0;
    this.scoreLimit = scoreLimit;
    this.winner = null;
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

  public getSelectedColour() {
    return this.selectedColour;
  }

  public getFirstHint() {
    return this.firstHint;
  }

  public getSecondHint() {
    return this.secondHint;
  }

  public getCurrentTurn() {
    return this.currentTurn;
  }

  public getScoreLimit() {
    return this.scoreLimit;
  }

  public getWinner() {
    return this.winner;
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

  public setHinter(hinter: Player) {
    this.hinter = hinter;
  }

  public setSelectedColour(colour: Colour) {
    this.selectedColour = colour;
  }

  public setFirstHint(clue: string) {
    this.firstHint = clue;
  }

  public setSecondHint(clue: string) {
    this.secondHint = clue;
  }

  public setPlayers(players: Player[]) {
    this.players = players;
  }

  public setCurrentTurn(player: Player) {
    this.currentTurn = player;
  }

  public setWinner(player: Player) {
    this.winner = player;
  }
}
