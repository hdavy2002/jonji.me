export interface IEmailService {
  sendOTP(to: string, code: string): Promise<void>;
}
