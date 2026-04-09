import { IWalletRepository } from '@jonji/domain';

export class GetWalletUseCase {
  constructor(private walletRepo: IWalletRepository) {}
  async execute(userId: string) {
    return { balance: 0.0, currency: 'GBP' };
  }
}
