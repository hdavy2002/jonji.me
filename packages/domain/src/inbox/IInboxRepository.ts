import { Thread } from './Thread';
export interface IInboxRepository {
  findById(id: string): Promise<Thread | null>;
}
