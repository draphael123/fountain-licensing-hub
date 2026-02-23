import { Component } from "react"
import { Link } from "react-router-dom"
import { useTheme } from "../context/ThemeContext"

function ErrorFallback({ error }) {
  const { theme } = useTheme()
  return (
    <div style={{ padding: 48, background: theme.bg0, minHeight: "100vh", color: theme.text, fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ marginBottom: 16 }}>Something went wrong</h1>
      <p style={{ color: theme.muted, marginBottom: 24 }}>
        This page encountered an error. Try going back to the dashboard.
      </p>
      <Link
        to="/"
        style={{
          display: "inline-block",
          padding: "12px 24px",
          background: theme.accent,
          color: theme.accentText,
          borderRadius: 8,
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Back to Dashboard
      </Link>
      {error && (
        <pre style={{ marginTop: 24, padding: 16, background: theme.bg2, borderRadius: 8, fontSize: 12, overflow: "auto", border: `1px solid ${theme.border1}` }}>
          {error.message}
        </pre>
      )}
    </div>
  )
}

export class ErrorBoundary extends Component {
  state = { hasError: false, error: null }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Page error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />
    }
    return this.props.children
  }
}
