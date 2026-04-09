import { ISiteRepository, Site } from '@jonji/domain';
import { createClient } from '@libsql/client';

export class TursoSiteRepository implements ISiteRepository {
  private client: any;
  constructor(url: string, token: string) {
    this.client = createClient({ url, authToken: token });
  }
  async findById(id: string): Promise<Site | null> {
    const result = await this.client.execute({ sql: "SELECT * FROM sites WHERE id = ?", args: [id] });
    return result.rows[0] as unknown as Site || null;
  }
  async save(site: Site): Promise<void> {
    await this.client.execute({
      sql: "INSERT INTO sites (id, slug, title) VALUES (?, ?, ?)",
      args: [site.id, site.slug, site.title]
    });
  }
}
