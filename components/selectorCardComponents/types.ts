export interface Pose {
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  benefits?: string[];
}