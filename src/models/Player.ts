import { Colour } from './Colour';
import { pickRandomColourFromGrid } from '../utils';
import { grid } from '../constants/grid';

export class Player {
  private id: string;
  private name: string;
  private role: string;
  private score: number;
  private colour: string;
  private firstTint: Colour;
  private secondTint: Colour;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.role = '';
    this.score = 0;
    this.colour = pickRandomColourFromGrid(grid);
    this.firstTint = null;
    this.secondTint = null;
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

  public getRole() {
    return this.role;
  }

  public getScore() {
    return this.score;
  }

  public getColour() {
    return this.colour;
  }
}
