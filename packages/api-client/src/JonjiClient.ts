export class JonjiClient {
  constructor(private baseUrl: string) {}
  async search(q: string) {
    const res = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(q)}`);
    return res.json();
  }
}
