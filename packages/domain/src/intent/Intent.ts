export interface Intent {
  id: string;
  type: string;
  visibility: 'public' | 'compatible_only' | 'hidden';
  active: boolean;
}
