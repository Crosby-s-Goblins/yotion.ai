'use client';

import Link from 'next/link';
import ProblemStatement from '@/components/problem-statement';
import ProductFeatures from '@/components/product-features';

export default function AboutPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6">
      {/* Problem Statement Section */}
      <ProblemStatement />

      {/* Features Section */}
      <ProductFeatures />

      {/* Call to Action */}
      <section className="flex flex-col items-center mt-20 pb-20 gap-4">
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