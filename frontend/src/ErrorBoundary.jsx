import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: 'red', fontFamily: 'sans-serif' }}>
          <h1>Something went wrong.</h1>
          <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', overflowX: 'auto', border: '1px solid #fca5a5' }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#991b1b' }}>{this.state.error?.toString()}</h3>
            <pre style={{ margin: 0, color: '#555' }}>
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
