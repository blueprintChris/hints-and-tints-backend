import { Room } from '../models/Room';

export class RoomStore {
  public rooms: RoomKeyStore = {};

  constructor() {}

  public store(key: string, value: any): void {
    this.rooms[key] = value;
  }

  public get(key: string): Room {
    return this.rooms[key];
  }

  public delete(key: string): void {
    delete this.rooms[key];
  }
}

type RoomKeyStore = {
  [key: string]: Room;
};
