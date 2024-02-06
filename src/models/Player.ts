export class Player {
  private id: string;
  private name: string;
  private isClueGiver: boolean;
  private isTurn: boolean;
  private score: number;

  constructor(id: string, name: string, isClueGiver = false) {
    this.id = id;
    this.name = name;
    this.isClueGiver = isClueGiver;
    this.isTurn = false;
    this.score = 0;
  }

  public setName(name: string) {
    this.name = name;
  }

  public setScore(score: number) {
    this.score = score;
  }

  public getName() {
    return this.name;
  }

  public getId() {
    return this.id;
  }

  public getIsClueGiver() {
    return this.isClueGiver;
  }

  public getIsTurn() {
    return this.isTurn;
  }

  public getScore() {
    return this.score;
  }
}
