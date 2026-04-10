export interface IAgentService {
  complete(prompt: string, context?: Record<string, unknown>): Promise<string>;
}
