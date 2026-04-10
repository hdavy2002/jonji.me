import {
  D1UserRepository,
  TursoSiteRepository,
  TinybirdSearchRepository,
  AnthropicAgentService,
  ResendEmailService,
  TursoPlatformClient,
} from '@jonji/infrastructure';
import {
  RegisterUserUseCase,
  CreateSiteUseCase,
  SearchStoresUseCase,
  SendOTPUseCase,
  VerifyOTPUseCase,
} from '@jonji/application';

export interface Container {
  sendOTP: SendOTPUseCase;
  verifyOTP: VerifyOTPUseCase;
  registerUser: RegisterUserUseCase;
  createSite: CreateSiteUseCase;
  searchStores: SearchStoresUseCase;
}

export function createContainer(env: any): Container {
  const userRepo = new D1UserRepository(env.DB);
  const emailService = new ResendEmailService(env.RESEND_API_KEY, env.RESEND_FROM_EMAIL);
  const tursoPlatform = new TursoPlatformClient(env.TURSO_ORG_SLUG, env.TURSO_PLATFORM_API_TOKEN);

  // UPSTASH REDIS — parked until social layer
  // Free plan is regional — re-enable with paid Global plan
  // when feed + presence + online tracking are added
  // const redis = new Redis({
  //   url: env.UPSTASH_REDIS_REST_URL,
  //   token: env.UPSTASH_REDIS_REST_TOKEN,
  // })

  // siteRepo and agentService are optional (require TURSO_URL/TURSO_TOKEN and ANTHROPIC_API_KEY)
  const siteRepo = env.TURSO_URL && env.TURSO_TOKEN
    ? new TursoSiteRepository(env.TURSO_URL, env.TURSO_TOKEN)
    : null;

  const searchRepo = new TinybirdSearchRepository(env.TINYBIRD_API_KEY, env.TINYBIRD_BASE_URL);
  const agentService = env.ANTHROPIC_API_KEY
    ? new AnthropicAgentService(env.ANTHROPIC_API_KEY)
    : null;

  return {
    sendOTP: new SendOTPUseCase(env.KV, emailService, env.LUCIA_SECRET),
    verifyOTP: new VerifyOTPUseCase(env.KV, userRepo, env.LUCIA_SECRET),
    registerUser: new RegisterUserUseCase(env.KV, userRepo, tursoPlatform),
    createSite: siteRepo && agentService ? new CreateSiteUseCase(siteRepo, agentService) : null as any,
    searchStores: new SearchStoresUseCase(searchRepo),
  };
}
