export interface Pose {
  id: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  benefits?: string[] | string;
  images?: Array<{ url: string }>;
}