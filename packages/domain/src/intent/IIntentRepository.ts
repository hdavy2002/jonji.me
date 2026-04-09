import { Intent } from './Intent';
export interface IIntentRepository {
  findById(id: string): Promise<Intent | null>;
  save(intent: Intent): Promise<void>;
}
