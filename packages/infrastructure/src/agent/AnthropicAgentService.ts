import { IAgentService } from '@jonji/domain';

export class AnthropicAgentService implements IAgentService {
  constructor(private apiKey: string) {}

  async generateA2UI(description: string): Promise<string> {
    // Anthropic API call logic would go here
    return JSON.stringify({ type: 'A2UI_Placeholder', description });
  }
}
