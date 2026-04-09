import { IInboxRepository, Thread } from '@jonji/domain';

export class GetThreadsUseCase {
  constructor(private inboxRepo: IInboxRepository) {}
  async execute(userId: string): Promise<Thread[]> {
    // Logic to fetch user threads
    return [];
  }
}
