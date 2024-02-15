import { Colour } from './Colour';
import { pickRandomColourFromGrid } from '../utils';
import { grid } from '../constants/grid';

export class Player {
  private id: string;
  private socketId: string;
  private name: string;
  private role: string;
  private score: number;
  private colour: string;
  private firstTint: Colour;
  private secondTint: Colour;
  private isHost?: boolean;

  constructor(id: string, name: string, socketId: string, isHost?: boolean) {
    this.id = id;
    this.socketId = socketId;
    this.name = name;
    this.role = '';
    this.score = 0;
    this.colour = pickRandomColourFromGrid(grid);
    this.firstTint = null;
    this.secondTint = null;
    this.isHost = isHost;
  }

  public getFirstTint() {
    return this.firstTint;
  }

  public getSecondTint() {
    return this.secondTint;
  }

  public getName() {
    return this.name;
  }

  public getId() {
    return this.id;
  }

  public getSocketId() {
    return this.socketId;
  }

  public getRole() {
    return this.role;
  }

  public getScore() {
    return this.score;
  }

  public getColour() {
    return this.colour;
  }

  public getIsHost() {
    return this.isHost;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setScore(score: number) {
    this.score = score;
  }

  public setPlayerRole(role: string) {
    this.role = role;
  }

  public setFirstTint(colour: Colour) {
    this.firstTint = colour;
  }

  public setSecondTint(colour: Colour) {
    this.secondTint = colour;
  }

  public setSocketId(socketId: string) {
    this.socketId = socketId;
  }

  public setIsHost(isHost: boolean) {
    this.isHost = isHost;
  }
}
