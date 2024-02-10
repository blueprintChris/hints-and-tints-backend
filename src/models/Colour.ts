export class Colour {
  private ref: string;
  private hex: string;
  private col: string;
  private x: number;
  private y: number;

  constructor(ref: string, hex: string, col: string, x?: number, y?: number) {
    this.ref = ref;
    this.hex = hex;
    this.col = col;
    this.x = x;
    this.y = y;
  }

  public getRef() {
    return this.ref;
  }

  public getHex() {
    return this.hex;
  }

  public getCol() {
    return this.col;
  }

  public getX() {
    return this.x;
  }

  public getY() {
    return this.y;
  }
}
