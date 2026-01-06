import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center my-4">
                    <h3 className="text-red-500 font-black uppercase tracking-widest text-sm mb-2">Component Error</h3>
                    <p className="text-gray-400 text-xs mb-4">Something went wrong in this section.</p>
                    <details className="text-[10px] text-left bg-black/30 p-2 rounded text-gray-500 overflow-auto max-h-32">
                        <summary className="cursor-pointer mb-1 hover:text-white">View Error Details</summary>
                        {this.state.error?.toString()}
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false })}
                        className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg uppercase tracking-wider"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
