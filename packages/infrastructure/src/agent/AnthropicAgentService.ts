import { IAgentService } from '@jonji/domain';

export class AnthropicAgentService implements IAgentService {
  constructor(private apiKey: string) {}

  async complete(prompt: string, context?: Record<string, unknown>): Promise<string> {
    // Anthropic API call logic would go here
    return JSON.stringify({ type: 'A2UI_Placeholder', prompt, context });
  }
}
