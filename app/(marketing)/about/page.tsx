'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Activity, Mic, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

// const TEAM = [
//   {
//     name: 'Name Here',
//     role: 'Role Here',
//     img: '/team/placeholder.jpg', // Placeholder image
//     bio: 'Short team member bio goes here.'
//   },
//   {
//     name: 'Name Here',
//     role: 'Role Here',
//     img: '/team/placeholder.jpg',
//     bio: 'Short team member bio goes here.'
//   },
//   {
//     name: 'Name Here',
//     role: 'Role Here',
//     img: '/team/placeholder.jpg',
//     bio: 'Short team member bio goes here.'
//   },
//   {
//     name: 'Name Here',
//     role: 'Role Here',
//     img: '/team/placeholder.jpg',
//     bio: 'Short team member bio goes here.'
//   },
// ];

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center gap-6 mt-20 mb-10">
        <h1 className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-tr from-primary to-accent bg-clip-text text-transparent drop-shadow-lg">About Yotion</h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl">
          <span className="font-semibold">Yotion</span> is your AI-powered yoga companion—blending intelligent pose correction, real-time feedback, and a vibrant community to help you move, breathe, and grow with confidence.
        </p>
        <div className="flex flex-wrap justify-center gap-4 mt-2">
          <span className="inline-block bg-primary/10 text-primary px-4 py-1 rounded-full text-sm font-medium">AI Pose Detection</span>
          <span className="inline-block bg-accent/10 text-accent px-4 py-1 rounded-full text-sm font-medium">Voice Feedback</span>
          <span className="inline-block bg-secondary/10 text-secondary px-4 py-1 rounded-full text-sm font-medium">Progress Tracking</span>
          <span className="inline-block bg-gray-100 text-gray-700 px-4 py-1 rounded-full text-sm font-medium">Community</span>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-white/90">
          <Activity className="w-10 h-10 text-primary mb-4" />
          <CardTitle className="mb-2 text-xl">Pose Detection</CardTitle>
          <CardContent className="text-gray-600 text-sm text-center px-2">
            Yotion uses your webcam and advanced AI to gently correct your posture, helping you improve form and reduce injury risk.
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-white/90">
          <Mic className="w-10 h-10 text-accent mb-4" />
          <CardTitle className="mb-2 text-xl">Voice Feedback</CardTitle>
          <CardContent className="text-gray-600 text-sm text-center px-2">
            Audio cues guide you through each pose, so you can focus on your breath and body—not the screen.
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-white/90">
          <Users className="w-10 h-10 text-secondary mb-4" />
          <CardTitle className="mb-2 text-xl">Community</CardTitle>
          <CardContent className="text-gray-600 text-sm text-center px-2">
            Connect, share, and celebrate with fellow practitioners. Join challenges, post progress, and find your yoga tribe.
          </CardContent>
        </Card>
        <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-white/90">
          <TrendingUp className="w-10 h-10 text-green-600 mb-4" />
          <CardTitle className="mb-2 text-xl">Progress Tracking</CardTitle>
          <CardContent className="text-gray-600 text-sm text-center px-2">
            Visualize your journey, review your history, and stay motivated with personalized stats and milestones.
          </CardContent>
        </Card>
      </section>

      {/* Team Section
      <section className="pt-8">
        <h2 className="text-3xl font-bold text-center mb-8">Meet the Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {TEAM.map((member, index) => (
            <Card key={`${member.name}-${index}`} className="flex flex-col items-center p-6 bg-white/95 shadow-xl border-0">
              <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-primary/20 shadow-md">
                <Image
                  src={member.img}
                  alt={member.name}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>
              <CardTitle className="text-lg font-semibold mb-1">{member.name}</CardTitle>
              <div className="text-primary text-xs font-medium mb-2">{member.role}</div>
              <CardContent className="text-gray-600 text-sm text-center px-1">{member.bio}</CardContent>
            </Card>
          ))}
        </div>
      </section> */}

      {/* Call to Action */}
      <section className="flex flex-col items-center pt-12 gap-4">
        <h3 className="text-2xl font-semibold text-center">Ready to elevate your practice?</h3>
        <p className="text-gray-700 text-center max-w-xl">
          Join Yotion today and experience the future of mindful movement—powered by AI, inspired by community, and designed for you.
        </p>
        <Link href="/" className="mt-2 px-8 py-3 rounded-full bg-gradient-to-tr from-primary to-accent text-white font-bold shadow-lg hover:from-primary/90 hover:to-accent/90 transition-all duration-200">
          Get Started
        </Link>
      </section>
    </main>
  );
}