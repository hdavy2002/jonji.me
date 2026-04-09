import { D1UserRepository, TursoSiteRepository, TinybirdSearchRepository, AnthropicAgentService } from '@jonji/infrastructure';
import { RegisterUserUseCase, CreateSiteUseCase, SearchStoresUseCase } from '@jonji/application';

export function createContainer(env: any) {
  const userRepo = new D1UserRepository(env.DB);
  const siteRepo = new TursoSiteRepository(env.TURSO_URL, env.TURSO_TOKEN);
  const searchRepo = new TinybirdSearchRepository(env.TINYBIRD_TOKEN, env.TINYBIRD_ENDPOINT);
  const agentService = new AnthropicAgentService(env.ANTHROPIC_API_KEY);

  return {
    registerUser: new RegisterUserUseCase(userRepo, null),
    createSite: new CreateSiteUseCase(siteRepo, agentService),
    searchStores: new SearchStoresUseCase(searchRepo),
  };
}
