'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function OnboardingPage() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenOnboarding');
    if (seen === 'true') {
      router.push('/chat');
    } else {
      setHasSeenOnboarding(true);
    }
  }, [router]);

  const handleContinue = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/chat');
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    router.push('/chat');
  };

  if (!hasSeenOnboarding) {
    return null;
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center p-4" style={{ position: 'relative', zIndex: 1 }}>
      {/* Animated Background Gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-400/20 via-blue-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Card - Glassmorphic Design */}
      <div className="relative flex w-full max-w-sm flex-col overflow-hidden glass-card rounded-3xl shadow-large animate-slide-up" style={{ backdropFilter: 'blur(20px)', background: 'rgba(255, 255, 255, 0.25)', border: '1px solid rgba(255, 255, 255, 0.18)' }}>
        {/* Header Section */}
        <div className="p-8 pb-6 text-left relative">
          {/* Icon with Gradient Background and Glow */}
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl relative overflow-hidden animate-float" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', boxShadow: '0 10px 40px rgba(102, 126, 234, 0.4)' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <span className="material-symbols-outlined !text-4xl text-white relative z-10">
              support_agent
            </span>
          </div>
          
          <h1 className="text-2xl font-bold leading-snug tracking-tight gradient-text" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome to your Campus Assistant
          </h1>
          <p className="text-gray-700 pt-1.5 text-[15px] font-normal leading-relaxed">
            Your personal guide to everything Providence College of Engineering.
          </p>
        </div>

        {/* Feature Cards - Neumorphic Style */}
        <div className="flex flex-col gap-3 px-8">
          <div className="flex items-center gap-4 rounded-2xl neu-card p-4 hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl icon-glass" style={{ background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%)', backdropFilter: 'blur(10px)' }}>
              <span className="material-symbols-outlined text-accent text-xl">map</span>
            </div>
            <div>
              <p className="text-charcoal text-base font-semibold leading-tight">
                Campus Navigation
              </p>
              <p className="text-gray-600 pt-0.5 text-sm font-normal leading-tight">
                Find your way to any building or hall.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl neu-card p-4 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl icon-glass" style={{ background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%)', backdropFilter: 'blur(10px)' }}>
              <span className="material-symbols-outlined text-accent text-xl">school</span>
            </div>
            <div>
              <p className="text-charcoal text-base font-semibold leading-tight">
                Academic Info
              </p>
              <p className="text-gray-600 pt-0.5 text-sm font-normal leading-tight">
                Access schedules and important deadlines.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 rounded-2xl neu-card p-4 hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl icon-glass" style={{ background: 'linear-gradient(135deg, rgba(79, 172, 254, 0.2) 0%, rgba(0, 242, 254, 0.2) 100%)', backdropFilter: 'blur(10px)' }}>
              <span className="material-symbols-outlined text-accent text-xl">event</span>
            </div>
            <div>
              <p className="text-charcoal text-base font-semibold leading-tight">
                Campus Events
              </p>
              <p className="text-gray-600 pt-0.5 text-sm font-normal leading-tight">
                Stay updated on the latest campus news.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Section */}
        <div className="mt-8 p-8 pt-4">
          <div className="flex justify-center gap-2 py-4">
            <div className="h-2 w-4 rounded-full" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', boxShadow: '0 0 10px rgba(79, 172, 254, 0.5)' }}></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
            <div className="h-2 w-2 rounded-full bg-gray-300"></div>
          </div>
          
          <button
            onClick={handleContinue}
            className="btn-primary w-full rounded-2xl py-4 text-base font-semibold text-white relative overflow-hidden group"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            <span className="relative z-10">Continue</span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </button>
          
          <button
            onClick={handleSkip}
            className="mt-3 w-full rounded-2xl py-3 text-sm font-medium text-gray-600 transition-all hover:bg-white/30 hover:text-gray-800 backdrop-blur-sm"
            style={{ background: 'rgba(255, 255, 255, 0.1)' }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
