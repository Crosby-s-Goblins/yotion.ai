'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, UserX, Frown } from 'lucide-react';

const PROBLEMS = [
  {
    icon: AlertTriangle,
    title: 'Poor Form',
    description: 'Without real-time feedback, it\'s easy to develop bad habits or risk injury with incorrect alignment.',
    bgColor: 'bg-red-50/50 hover:bg-red-50/80',
    iconBgColor: 'bg-red-100',
    iconColor: 'text-red-600'
  },
  {
    icon: Clock,
    title: 'Inconsistent Practice',
    description: 'Staying motivated and maintaining a regular practice routine can be challenging without proper guidance.',
    bgColor: 'bg-orange-50/50 hover:bg-orange-50/80',
    iconBgColor: 'bg-orange-100',
    iconColor: 'text-orange-600'
  },
  {
    icon: UserX,
    title: 'Generic Instruction',
    description: 'One-size-fits-all classes don\'t address your unique needs, flexibility level, or personal goals.',
    bgColor: 'bg-yellow-50/50 hover:bg-yellow-50/80',
    iconBgColor: 'bg-yellow-100',
    iconColor: 'text-yellow-600'
  },
  {
    icon: Frown,
    title: 'Lack of Community',
    description: 'Practicing alone can feel isolating, with no support system to celebrate progress or overcome challenges.',
    bgColor: 'bg-blue-50/50 hover:bg-blue-50/80',
    iconBgColor: 'bg-blue-100',
    iconColor: 'text-blue-600'
  }
];

export default function ProblemStatement() {
  return (
    <section className="py-16 mt-8 mb-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          The Struggles of <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Traditional Yoga</span>
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Many practitioners face common challenges that hold them back from reaching their full potential
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PROBLEMS.map((problem, index) => {
          const IconComponent = problem.icon;
          return (
            <Card key={`${problem.title}-${index}`} className={`flex flex-col items-center py-8 shadow-lg border-0 transition-colors ${problem.bgColor}`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${problem.iconBgColor}`}>
                <IconComponent className={`w-8 h-8 ${problem.iconColor}`} />
              </div>
              <CardTitle className="mb-2 text-lg text-gray-900">{problem.title}</CardTitle>
              <CardContent className="text-gray-600 text-sm text-center px-2">
                {problem.description}
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="text-center mt-12">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
          <span className="text-2xl">⬇️</span>
          <span className="font-medium text-gray-800">That's where Yotion steps in</span>
        </div>
      </div>
    </section>
  );
} 