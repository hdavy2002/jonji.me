export interface Thread {
  id: string;
  threadType: 'agent_deal' | 'human_chat';
  withUsername: string;
}
