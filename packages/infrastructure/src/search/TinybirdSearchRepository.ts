import { ISearchRepository, SearchResult } from '@jonji/domain';

export class TinybirdSearchRepository implements ISearchRepository {
  constructor(private token: string, private endpoint: string) {}

  async search(rawQuery: string, filters: any = {}): Promise<any[]> {
    const conditions: string[] = ['availability_flag = 1'];

    if (filters.category)
      conditions.push(`category = '${filters.category.replace(/'/g, "''")}'`);
    if (filters.intentType)
      conditions.push(`intent_type = '${filters.intentType.replace(/'/g, "''")}'`);
    if (filters.agentMode)
      conditions.push(`agent_mode = '${filters.agentMode}'`);
    if (filters.priceMax)
      conditions.push(`price_min <= ${Number(filters.priceMax)}`);
    if (filters.priceMin)
      conditions.push(`price_max >= ${Number(filters.priceMin)}`);
    if (filters.locationText) {
      const loc = filters.locationText.replace(/'/g, "''");
      conditions.push(`position('${loc}' IN location_text) > 0`);
    }

    if (rawQuery) {
      const q = rawQuery.replace(/'/g, "''");
      conditions.push(`(title ILIKE '%${q}%' OR description ILIKE '%${q}%')`);
    }

    const sql = `
      SELECT site_id, user_id, username, slug, title,
             description, site_type, intent_type, agent_mode,
             category, location_text, price_min, price_max,
             currency, availability_flag, verified, thumbnail_url
      FROM search_index
      WHERE ${conditions.join(' AND ')}
      ORDER BY verified DESC, updated_at DESC
      LIMIT 20
    `;

    const res = await fetch(
      `${this.endpoint}/v0/sql?q=${encodeURIComponent(sql)}`,
      { headers: { Authorization: `Bearer ${this.token}` } }
    );
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Tinybird SQL error ${res.status}: ${err}`);
    }
    const data = await res.json() as { data: Record<string, unknown>[] };

    return data.data.map(row => ({
      siteId: row.site_id as string,
      userId: row.user_id as string,
      username: row.username as string,
      slug: row.slug as string,
      title: row.title as string,
      description: row.description as string,
      siteType: row.site_type as string,
      intentType: row.intent_type as string,
      agentMode: row.agent_mode as string,
      category: row.category as string,
      locationText: row.location_text as string,
      priceMin: row.price_min as number,
      priceMax: row.price_max as number,
      currency: (row.currency as string) || 'GBP',
      availabilityFlag: (row.availability_flag as number) === 1,
      verified: (row.verified as number) === 1,
      thumbnailUrl: row.thumbnail_url as string,
      url: `https://jonji.me/@${row.username}/${row.slug}`,
    }));
  }
}