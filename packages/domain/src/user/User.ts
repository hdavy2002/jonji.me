export interface User {
  id: string;
  email: string;
  username: string;
  tursoDbUrl: string;
  tursoAuthToken: string;
  plan: 'free' | 'pro' | 'business' | 'enterprise';
  verifiedTier: 'none' | 'phone' | 'id' | 'professional';
  createdAt: number;
}
