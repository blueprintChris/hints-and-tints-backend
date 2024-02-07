export class Player {
  private id: string;
  private name: string;
  private role: string;
  private isTurn: boolean;
  private score: number;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
    this.role = '';
    this.isTurn = false;
    this.score = 0;
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

  public getName() {
    return this.name;
  }

  public getId() {
    return this.id;
  }

  public getRole() {
    return this.role;
  }

  public getIsTurn() {
    return this.isTurn;
  }

  public getScore() {
    return this.score;
  }
}
