import { Site } from './Site';
export interface ISiteRepository {
  findById(id: string): Promise<Site | null>;
  save(site: Site): Promise<void>;
}
