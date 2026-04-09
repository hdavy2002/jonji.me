import { ISiteRepository, Site, IAgentService } from '@jonji/domain';

export class CreateSiteUseCase {
  constructor(
      private siteRepo: ISiteRepository, 
      private agentService: IAgentService
  ) {}

  async execute(userId: string, description: string): Promise<Site> {
    const a2uiJson = await this.agentService.generateA2UI(description);
    const site: Site = { 
        id: crypto.randomUUID(), 
        slug: 'new-site', 
        title: 'New Site', 
        siteType: 'info', 
        published: false 
    };
    await this.siteRepo.save(site);
    return site;
  }
}
