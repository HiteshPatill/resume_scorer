'use client';

import React, { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Oops! Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/80 transition-colors"
            >
              Go Home
            </button>
            {this.state.error && (
              <details className="mt-4 text-left text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground">
                  Error details
                </summary>
                <pre className="mt-2 overflow-auto p-2 bg-muted rounded">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
