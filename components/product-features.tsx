'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Activity, Mic, Users, TrendingUp } from 'lucide-react';
import Image from 'next/image';

const FEATURES = [
  {
    icon: Activity,
    title: 'Pose Detection',
    description: 'Yotion uses your webcam and advanced AI to gently correct your posture, helping you improve form and reduce injury risk.',
    iconColor: 'text-primary',
    imagePlaceholder: 'AI Camera Detection',
    bgGradient: 'from-blue-100 to-purple-100',
    image: null // Add image path here when ready
  },
  {
    icon: Mic,
    title: 'Voice Feedback',
    description: 'Audio cues guide you through each pose, so you can focus on your breath and body—not the screen.',
    iconColor: 'text-accent',
    imagePlaceholder: 'Audio Guidance',
    bgGradient: 'from-green-100 to-teal-100',
    image: null // Add image path here when ready
  },
  {
    icon: Users,
    title: 'Community',
    description: 'Connect, share, and celebrate with fellow practitioners. Join challenges, post progress, and find your yoga tribe.',
    iconColor: 'text-secondary',
    imagePlaceholder: 'Community Hub',
    bgGradient: 'from-purple-100 to-pink-100',
    image: '/community.jpg' // Add your community image path here
  },
  {
    icon: TrendingUp,
    title: 'Progress Tracking',
    description: 'Visualize your journey, review your history, and stay motivated with personalized stats and milestones.',
    iconColor: 'text-green-600',
    imagePlaceholder: 'Progress Charts',
    bgGradient: 'from-orange-100 to-yellow-100',
    image: '/performance.jpg' // Add image path here when ready
  }
];

export default function ProductFeatures() {
  return (
    <section className="flex flex-col gap-8">
      {FEATURES.map((feature, index) => {
        const IconComponent = feature.icon;
        const isImageLeft = index % 2 === 0; // Cards 1 and 3 (index 0,2) have image on left
        
        return (
          <Card key={`${feature.title}-${index}`} className="overflow-hidden shadow-2xl border border-gray-300/90 bg-white min-h-[400px] md:min-h-[300px] hover:shadow-2xl hover:ring-2 hover:ring-gray-300/50 hover:border-gray-400/90 transition-all duration-300 ease-in-out hover:-translate-y-1 ring-1 ring-gray-200/70">
            <div className={`flex flex-col md:flex-row ${!isImageLeft ? 'md:flex-row-reverse' : ''} h-full`}>
              {/* Image or Placeholder */}
              <div className={`w-full md:w-3/5 lg:w-3/5 h-64 md:h-auto md:min-h-[300px] relative border-b border-gray-300/70 md:border-b-0 ${isImageLeft ? 'md:border-r' : 'md:border-l'} md:border-gray-300/70`}>
                {feature.image ? (
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 60vw"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${feature.bgGradient} flex items-center justify-center`}>
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700">
                        {feature.imagePlaceholder}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Content */}
              <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <IconComponent className={`w-8 h-8 ${feature.iconColor}`} />
                  <CardTitle className="text-xl md:text-2xl">{feature.title}</CardTitle>
                </div>
                <CardContent className="text-gray-600 text-sm md:text-base leading-relaxed p-0">
                  {feature.description}
                </CardContent>
              </div>
            </div>
          </Card>
        );
      })}
    </section>
  );
} 