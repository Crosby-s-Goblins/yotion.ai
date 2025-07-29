'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Clock, UserX, Frown, Zap, ArrowDown, Sparkles, Heart } from 'lucide-react';

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
    <section className="my-20">
      <div className="text-center mb-12">
        <h2 className="font-semibold text-2xl sm:text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
          <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Traditional yoga</span> sucks.
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Beginner yogis face common challenges that hold them back from reaching their full potential
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
      
      {/* Story Transition */}
      <div className="relative mt-16 mb-8">
        {/* Decorative line with gradient */}
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 w-px h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>
        
        {/* Main transition container */}
        <div className="flex flex-col items-center text-center space-y-6 pt-16">
          {/* Visual separator with icons */}
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-2"></div>
            </div>
            
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-white shadow-lg">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              {/* Subtle glow effect */}
              <div className="absolute inset-0 w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 animate-pulse"></div>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mx-2"></div>
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
          </div>
          
          {/* Main message */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-wider text-gray-500 font-medium">
              Enter the Solution
            </p>
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              That&apos;s where Yotion steps in
            </h3>
            <p className="text-gray-600 max-w-md mx-auto text-sm">
              Transforming traditional yoga with AI-powered guidance and community support
            </p>
          </div>
          
          {/* Elegant arrow indicator */}
          <div className="flex flex-col items-center space-y-2 opacity-60">
            <ArrowDown className="w-6 h-6 text-gray-400 animate-bounce" />
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>
      </div>
    </section>
  );
} 