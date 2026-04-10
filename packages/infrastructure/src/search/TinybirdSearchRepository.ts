import { ISearchRepository, SearchResult } from '@jonji/domain';

export class TinybirdSearchRepository implements ISearchRepository {
  constructor(private token: string, private endpoint: string) {}

  async search(query: string): Promise<SearchResult[]> {
    const response = await fetch(`${this.endpoint}/v0/pipes/search_sites.json?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    });
    const data = await response.json() as { data: SearchResult[] };
    return data.data;
  }
}
