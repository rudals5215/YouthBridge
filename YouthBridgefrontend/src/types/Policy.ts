export interface Policy {
  id: string;
  title: string;
  description: string;
  category: string;
  region: string;
  minAge?: number;
  maxAge?: number;
}
