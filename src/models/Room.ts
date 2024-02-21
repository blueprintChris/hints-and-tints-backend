import { Colour } from './Colour';
import { Player } from './Player';

export class Room {
  private id: string;
  private players: Player[];
  private spectators: Player[];
  private currentTurn: Player;
  private hinter: Player;
  private state: string;
  private selectedColour: Colour;
  private firstHint: string;
  private secondHint: string;
  private roundNumber: number;
  private scoreLimit: number;
  private winner: Player;
  private created: Date;

  constructor(id: string, scoreLimit: number) {
    this.id = id;
    this.players = [];
    this.spectators = [];
    this.currentTurn = null;
    this.hinter = null;
    this.state = 'LOBBY';
    this.selectedColour = null;
    this.firstHint = '';
    this.secondHint = '';
    this.roundNumber = 0;
    this.scoreLimit = scoreLimit;
    this.winner = null;
    this.created = new Date();
  }

  public getAllPlayers() {
    return this.players;
  }

  public getPlayerById(id: string): Player {
    return this.players.find(p => p.getId() === id);
  }

  public getPlayerBySocketId(id: string) {
    return this.players.find(p => p.getSocketId() === id);
  }

  public getAllSpectators() {
    return this.spectators;
  }

  public getSpectatorById(id: string) {
    return this.spectators.find(p => p.getId() === id);
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

  public getCreated() {
    return this.created;
  }

  public isEmpty() {
    return this.spectators.length === 0 && this.players.length === 0;
  }

  public addPlayer(player: Player) {
    this.players.push(player);
  }

  public addSpectator(player: Player) {
    this.spectators.push(player);
  }

  public removeSpectator(spectator: Player) {
    const spectatorIndex = this.spectators.indexOf(spectator);

    this.spectators.splice(spectatorIndex, 1);
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

  public setScoreLimit(scoreLimit: number) {
    this.scoreLimit = scoreLimit;
  }
}
