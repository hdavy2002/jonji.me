export class GetWalletUseCase {
  async execute(_userId: string) {
    return { balance: 0.0, currency: 'GBP' };
  }
}
