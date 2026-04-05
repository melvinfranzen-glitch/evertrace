import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#F7F3ED" }}>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-3" style={{ fontFamily: "'Cormorant Garamond', serif", color: "#2F2D2A" }}>
            Ein unerwarteter Fehler ist aufgetreten
          </h1>
          <p className="text-sm mb-6" style={{ color: "#6B6257", fontFamily: "'Lato', sans-serif", fontWeight: 300 }}>
            Bitte laden Sie die Seite neu. Falls das Problem weiterhin besteht, kontaktieren Sie uns unter hallo@evertrace.de.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 rounded-xl text-sm"
            style={{ background: "#B07B34", color: "#F7F3ED", fontFamily: "'Lato', sans-serif" }}
          >
            Seite neu laden
          </button>
        </div>
      </div>
    );
    return this.props.children;
  }
}