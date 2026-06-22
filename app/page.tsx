'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle, Zap, Upload, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AnalysisPage from '@/components/AnalysisPage';

export default function Page() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (showAnalysis) {
    return <AnalysisPage onBack={() => setShowAnalysis(false)} />;
  }

  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1" />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      {/* Hero Section */}
      <section className="flex-1 px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-28">
        <div className="max-w-6xl mx-auto">
          {/* Main Hero Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-16 lg:mb-24">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance leading-tight">
                  Know Your Resume&apos;s Real Score
                </h1>
                <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                  AI-powered ATS analysis reveals exactly how recruiters see your resume. Get detailed insights before you apply.
                </p>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setShowAnalysis(true)}
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 group"
              >
                Analyze Your Resume
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Trust Indicators */}
              <div className="space-y-3 pt-4">
                <p className="text-sm text-muted-foreground">Why candidates love ResumeScore:</p>
                <div className="space-y-2">
                  {['Real ATS parsing algorithms', 'Instant detailed feedback', 'Free forever'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Mascot and Visual */}
            <div className="flex justify-center lg:justify-end items-center">
              <div className="relative w-full max-w-sm">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/20 rounded-3xl blur-3xl" />
                {/* Mascot container */}
                <div className="relative bg-card border border-border rounded-3xl p-8 shadow-2xl">
                  <img
                    src="/bolt-mascot.png"
                    alt="ResumeScore Bolt Mascot"
                    className="w-full h-auto"
                  />
                  <div className="absolute top-4 right-4 bg-accent/20 backdrop-blur-sm rounded-full p-3 border border-accent/30">
                    <Zap className="w-6 h-6 text-accent" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div className="mt-20 lg:mt-28">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  icon: Upload,
                  title: 'Upload Your Resume',
                  description: 'Simply upload your resume in PDF or text format',
                },
                {
                  icon: Zap,
                  title: 'AI Analysis',
                  description: 'Our AI parses it using real ATS algorithms',
                },
                {
                  icon: TrendingUp,
                  title: 'Get Insights',
                  description: 'Receive detailed scores and actionable feedback',
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="group relative bg-card border border-border rounded-xl p-6 md:p-8 hover:border-accent/50 transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/30 transition-colors">
                      <feature.icon className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-20 lg:mt-28 text-center space-y-6">
            <div className="inline-block">
              <div className="bg-card border border-border rounded-full px-4 py-2 text-sm text-muted-foreground mb-6">
                ✨ Completely free to use
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">Ready to optimize your resume?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get instant ATS feedback and stand out to recruiters. Start analyzing now.
            </p>
            <button
              onClick={() => setShowAnalysis(true)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-accent/20"
            >
              Start Free Analysis
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
