export class Username {
  constructor(readonly value: string) {
    if (!/^[a-z0-9_]{3,20}$/.test(value)) throw new Error('Invalid username');
  }
}
