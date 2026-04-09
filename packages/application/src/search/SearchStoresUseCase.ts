import { ISearchRepository, SearchResult } from '@jonji/domain';

export class SearchStoresUseCase {
  constructor(private searchRepo: ISearchRepository) {}
  async execute(query: string): Promise<SearchResult[]> {
    return await this.searchRepo.search(query);
  }
}
