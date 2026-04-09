import { IUserRepository, User } from '@jonji/domain';

export class RegisterUserUseCase {
  constructor(private userRepo: IUserRepository, private tursoFactory: any) {}

  async execute(email: string, username: string): Promise<User> {
    const user: User = { 
        id: crypto.randomUUID(), 
        email, 
        username, 
        tursoDbUrl: '', 
        tursoAuthToken: '', 
        plan: 'free', 
        verifiedTier: 'none', 
        createdAt: Date.now() 
    };
    await this.userRepo.save(user);
    return user;
  }
}
