'use client';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Activity, Mic, Users, TrendingUp, AlertTriangle, Clock, UserX, Frown } from 'lucide-react';
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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            The Struggles of <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">Traditional Yoga</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Many practitioners face common challenges that hold them back from reaching their full potential
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-red-50/50 hover:bg-red-50/80 transition-colors">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="mb-2 text-lg text-gray-900">Poor Form</CardTitle>
            <CardContent className="text-gray-600 text-sm text-center px-2">
              Without real-time feedback, it's easy to develop bad habits or risk injury with incorrect alignment.
            </CardContent>
          </Card>
          
          <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-orange-50/50 hover:bg-orange-50/80 transition-colors">
            <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="mb-2 text-lg text-gray-900">Inconsistent Practice</CardTitle>
            <CardContent className="text-gray-600 text-sm text-center px-2">
              Staying motivated and maintaining a regular practice routine can be challenging without proper guidance.
            </CardContent>
          </Card>
          
          <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-yellow-50/50 hover:bg-yellow-50/80 transition-colors">
            <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
              <UserX className="w-8 h-8 text-yellow-600" />
            </div>
            <CardTitle className="mb-2 text-lg text-gray-900">Generic Instruction</CardTitle>
            <CardContent className="text-gray-600 text-sm text-center px-2">
              One-size-fits-all classes don't address your unique needs, flexibility level, or personal goals.
            </CardContent>
          </Card>
          
          <Card className="flex flex-col items-center py-8 shadow-lg border-0 bg-blue-50/50 hover:bg-blue-50/80 transition-colors">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <Frown className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="mb-2 text-lg text-gray-900">Lack of Community</CardTitle>
            <CardContent className="text-gray-600 text-sm text-center px-2">
              Practicing alone can feel isolating, with no support system to celebrate progress or overcome challenges.
            </CardContent>
          </Card>
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
            <span className="text-2xl">⬇️</span>
            <span className="font-medium text-gray-800">That's where Yotion steps in</span>
          </div>
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