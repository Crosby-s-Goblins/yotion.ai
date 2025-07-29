export interface Pose {
  id: number;
  name: string;
  labels?: {
    difficulty?: 'Easy' | 'Medium' | 'Hard';
    primary?: string[];
    secondary?: string[];
    [key: string]: unknown;
  };
  description?: string;
  benefits?: string[] | string;
  images?: string;
  isFree?: boolean;
  isAsymmetric?: boolean;
}

export interface Session {
  id: number | string;
  name: string;
  posesIn: string[];
  poseTiming: number[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  searchRes: string;
  isUser?: boolean;
}