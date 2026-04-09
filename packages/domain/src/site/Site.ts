export interface Site {
  id: string;
  slug: string;
  title: string;
  siteType: 'sell' | 'service' | 'rent' | 'info';
  published: boolean;
}
