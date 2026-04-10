import { Redis } from '@upstash/redis';
import {
  D1UserRepository,
  TursoSiteRepository,
  TinybirdSearchRepository,
  AnthropicAgentService,
  ResendEmailService,
  TursoPlatformClient,
} from '../../../packages/infrastructure/src';
import {
  RegisterUserUseCase,
  CreateSiteUseCase,
  SearchStoresUseCase,
  SendOTPUseCase,
  VerifyOTPUseCase,
} from '../../../packages/application/src';

export interface Container {
  sendOTP: SendOTPUseCase;
  verifyOTP: VerifyOTPUseCase;
  registerUser: RegisterUserUseCase;
  createSite: CreateSiteUseCase;
  searchStores: SearchStoresUseCase;
}

export function createContainer(env: any): Container {
  const userRepo = new D1UserRepository(env.DB);

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN,
  });

  const emailService = new ResendEmailService(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL);
  const tursoPlatform = new TursoPlatformClient(env.TURSO_ORG_SLUG, env.TURSO_PLATFORM_API_TOKEN);

  // siteRepo and agentService are optional (require TURSO_URL/TURSO_TOKEN and ANTHROPIC_API_KEY)
  const siteRepo = env.TURSO_URL && env.TURSO_TOKEN
    ? new TursoSiteRepository(env.TURSO_URL, env.TURSO_TOKEN)
    : null;

  const searchRepo = new TinybirdSearchRepository(env.TINYBIRD_API_KEY, env.TINYBIRD_BASE_URL);
  const agentService = env.ANTHROPIC_API_KEY
    ? new AnthropicAgentService(env.ANTHROPIC_API_KEY)
    : null;

  return {
    sendOTP: new SendOTPUseCase(redis, emailService),
    verifyOTP: new VerifyOTPUseCase(redis, userRepo),
    registerUser: new RegisterUserUseCase(redis, userRepo, tursoPlatform),
    createSite: siteRepo && agentService ? new CreateSiteUseCase(siteRepo, agentService) : null as any,
    searchStores: new SearchStoresUseCase(searchRepo),
  };
}
