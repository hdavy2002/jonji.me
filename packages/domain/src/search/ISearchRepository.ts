export interface SearchResult {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  score: number;
}

export interface ISearchRepository {
  search(query: string): Promise<SearchResult[]>;
}
