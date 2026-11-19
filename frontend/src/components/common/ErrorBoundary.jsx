import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
          <div className="max-w-md w-full p-8 bg-white border-2 border-black rounded-2xl neo-shadow-lg text-center space-y-4">
            <div className="w-12 h-12 bg-[#ff5c5c] border-2 border-black rounded-xl flex items-center justify-center mx-auto neo-shadow-sm">
              <AlertTriangle className="w-6 h-6 text-black" />
            </div>
            <h3 className="font-heading font-black text-2xl text-black">
              Something went wrong
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium">
              An unexpected render error occurred. You can reload this view or navigate back to the dashboard.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-neutral-100 border border-black/20 rounded-lg text-left text-[11px] font-mono text-red-600 overflow-x-auto max-h-28">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2.5 bg-[#ffe17c] text-black border-2 border-black rounded-xl neo-btn text-xs font-black flex items-center justify-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload
              </button>
              <a
                href="/admin/dashboard"
                className="flex-1 py-2.5 bg-black text-white border-2 border-black rounded-xl neo-btn text-xs font-black flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" /> Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
