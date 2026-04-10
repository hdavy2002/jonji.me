export interface TursoDatabase {
  name: string;
  id: string;
  hostname: string;
  dbUrl: string;
  authToken: string;
}

export interface ITursoPlatformClient {
  createUserDatabase(userId: string): Promise<{ dbUrl: string; authToken: string }>;
}

export class TursoPlatformClient implements ITursoPlatformClient {
  constructor(
    private readonly orgSlug: string,
    private readonly apiToken: string,
  ) {}

  async createUserDatabase(userId: string): Promise<{ dbUrl: string; authToken: string }> {
    const response = await fetch(
      `https://api.turso.tech/v1/organizations/${this.orgSlug}/databases`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: userId, group: 'default' }),
      },
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Failed to create Turso database: ${response.status} ${err}`);
    }

    // Turso Platform API v1 response:
    // { database: "name", username: "...", password: "..." }
    // Connection URL: <database>.<org>.turso.io
    const data = (await response.json()) as { database: string; username: string; password: string };
    const dbUrl = `https://${data.database}.${this.orgSlug}.turso.io`;
    return { dbUrl, authToken: data.password };
  }
}
