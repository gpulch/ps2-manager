import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Button } from '../../ui/Button';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="section"
          style={{
            padding: '2rem',
            textAlign: 'center',
            background: 'var(--neo-surface)',
            border: '2px solid var(--ui-danger)',
            borderRadius: '10px',
            margin: '2rem',
          }}
        >
          <h2 style={{ color: 'var(--ui-danger)' }}>Something went wrong</h2>
          <p style={{ margin: '1rem 0', opacity: 0.8 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <div
            className="row"
            style={{ justifyContent: 'center', gap: '12px' }}
          >
            <Button onClick={this.handleReset}>Try Again</Button>
            <Button variant="ghost" onClick={() => window.location.reload()}>
              Reload App
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
