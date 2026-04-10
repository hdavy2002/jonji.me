export interface TursoDBCredentials {
  dbUrl: string
  authToken: string
}

export class TursoPlatformClient {
  private readonly baseUrl = 'https://api.turso.tech/v1'

  constructor(
    private readonly orgSlug: string,
    private readonly apiToken: string,
  ) {}

  async createUserDatabase(userId: string): Promise<TursoDBCredentials> {
    // Database names must be lowercase alphanumeric + hyphens, max 32 chars
    // userId format: usr_xxxxxxxxxxxxxxxx — strip prefix, keep 16 chars
    const dbName = `u-${userId.replace('usr_', '').slice(0, 20)}`

    // Step 1: Create the database
    const createResponse = await fetch(
      `${this.baseUrl}/organizations/${this.orgSlug}/databases`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: dbName,
          group: 'default',
        }),
      },
    )

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      throw new Error(
        `Turso create database failed: ${createResponse.status} — ${errorText}`,
      )
    }

    // Response shape: { database: { Hostname: "dbname-org.turso.io", ... } }
    const createData = (await createResponse.json()) as {
      database: {
        Hostname: string // capital H. includes org slug already.
        Name: string
        DbId: string
      }
    }

    const hostname = createData.database.Hostname
    if (!hostname) {
      throw new Error(
        `Turso create response missing Hostname. Got: ${JSON.stringify(createData)}`,
      )
    }

    // libsql:// protocol for @libsql/client
    const dbUrl = `libsql://${hostname}`

    // Step 2: Generate auth token for this database
    const tokenResponse = await fetch(
      `${this.baseUrl}/organizations/${this.orgSlug}/databases/${dbName}/auth/tokens`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
      },
    )

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      throw new Error(
        `Turso token generation failed: ${tokenResponse.status} — ${errorText}`,
      )
    }

    // Response shape: { jwt: "eyJ..." }
    const tokenData = (await tokenResponse.json()) as { jwt: string }

    if (!tokenData.jwt) {
      throw new Error(
        `Turso token response missing jwt. Got: ${JSON.stringify(tokenData)}`,
      )
    }

    return {
      dbUrl,
      authToken: tokenData.jwt,
    }
  }
}
