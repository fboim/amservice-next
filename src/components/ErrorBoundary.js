'use client'

import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'var(--am-surface)',
            border: '1px solid var(--am-border)',
            borderRadius: 16,
            padding: '2rem',
            maxWidth: 400
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              opacity: 0.5
            }}>
              <i className="bi bi-exclamation-triangle" style={{ color: '#ef4444' }} />
            </div>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              marginBottom: '0.5rem',
              color: 'var(--am-text)'
            }}>
              Terjadi Kesalahan
            </h2>
            <p style={{
              color: 'var(--am-text-muted)',
              fontSize: '0.875rem',
              marginBottom: '1.5rem'
            }}>
              Kami telah mencatat error ini. Silakan coba lagi.
            </p>
            <button
              onClick={this.handleRetry}
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                color: '#fff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: 8,
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              <i className="bi bi-arrow-repeat" style={{ marginRight: 8 }} />
              Coba Lagi
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary(Component) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}