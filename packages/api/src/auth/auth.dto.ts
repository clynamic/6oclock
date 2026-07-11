export class MeResponse {
  constructor(value: MeResponse) {
    Object.assign(this, value);
  }

  userId: number;
  username: string;
  level: string;
}
