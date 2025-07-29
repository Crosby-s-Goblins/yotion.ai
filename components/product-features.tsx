'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Activity, Mic, Users, TrendingUp } from 'lucide-react';

const FEATURES = [
  {
    icon: Activity,
    title: 'Pose Detection',
    description: 'Yotion uses your webcam and advanced AI to gently correct your posture, helping you improve form and reduce injury risk.',
    iconColor: 'text-primary'
  },
  {
    icon: Mic,
    title: 'Voice Feedback',
    description: 'Audio cues guide you through each pose, so you can focus on your breath and body—not the screen.',
    iconColor: 'text-accent'
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect, share, and celebrate with fellow practitioners. Join challenges, post progress, and find your yoga tribe.',
    iconColor: 'text-secondary'
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visualize your journey, review your history, and stay motivated with personalized stats and milestones.',
    iconColor: 'text-green-600'
  }
];

export default function ProductFeatures() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {FEATURES.map((feature, index) => {
        const IconComponent = feature.icon;
        return (
          <Card key={`${feature.title}-${index}`} className="flex flex-col items-center py-8 shadow-lg border-0 bg-white/90">
            <IconComponent className={`w-10 h-10 ${feature.iconColor} mb-4`} />
            <CardTitle className="mb-2 text-xl">{feature.title}</CardTitle>
            <CardContent className="text-gray-600 text-sm text-center px-2">
              {feature.description}
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
} 