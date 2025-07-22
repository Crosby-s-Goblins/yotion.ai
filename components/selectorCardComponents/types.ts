export interface Pose {
  id: number;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description?: string;
  benefits?: string[] | string;
  images?: string;
  isFree?: boolean;
  isAsymmetric?: boolean;
}

export interface Session {
  id: number;
  name: string;
  posesIn: string[];
  poseTiming: number[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  searchRes: string;
  isUser?: boolean;
}