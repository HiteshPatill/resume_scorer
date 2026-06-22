'use client';

import { Zap } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              ResumeScore
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
              AI-Powered ATS Resume Analysis
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
