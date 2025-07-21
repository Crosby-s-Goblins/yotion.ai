'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';

export default function aboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 space-y-10">
      <h1 className="text-4xl font-bold text-center">About Yotion</h1>

      <section className="text-center space-y-4">
        <p className="text-lg text-gray-700">
          Welcome to <span className="font-semibold">Yotion</span> — your AI-powered yoga companion designed to elevate your practice with intelligent guidance, real-time feedback, and personalized workouts.
        </p>
        <p className="text-gray-600">
          Whether you&apos;re a total beginner or a seasoned yogi, Yotion helps you align, breathe, and move with confidence.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pose Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Yotion watches your posture using your webcam and gives gentle corrections to help improve form and reduce injury risk.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Voice Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Audio cues support you through each pose, ensuring you stay focused on breath and body—not screens.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Connect with fellow practitioners, celebrate milestones, and share your journey for encouragement and accountability.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Review your history and accomplishments to stay motivated and consistent.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="pt-12">
        <h2 className="text-2xl font-semibold text-center mb-6">Meet the Team</h2>
        <Carousel className="w-full">
          <CarouselContent>
            <CarouselItem className="basis-full md:basis-1/3">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Alex</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Product lead & yoga nerd.</p>
                </CardContent>
              </Card>
            </CarouselItem>
            <CarouselItem className="basis-full md:basis-1/3">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Jordan</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">ML engineer & alignment guru.</p>
                </CardContent>
              </Card>
            </CarouselItem>
            <CarouselItem className="basis-full md:basis-1/3">
              <Card className="text-center">
                <CardHeader>
                  <CardTitle>Sam</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">Frontend dev & breathing coach.</p>
                </CardContent>
              </Card>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </section>
    </main>
  );
}

//Fiddle with word choice and styles