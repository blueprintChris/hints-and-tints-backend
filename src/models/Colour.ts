export class Colour {
  private ref: string;
  private hex: string;
  private col: string;

  constructor(ref: string, hex: string, col: string) {
    this.ref = ref;
    this.hex = hex;
    this.col = col;
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
}
