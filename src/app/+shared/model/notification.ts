

export class SGNotification {
  msg: string;
  type: string = 'inform' || '';

  constructor(msg: string, type: string) {
    this.msg = msg;
    this.type = type;
  }
}