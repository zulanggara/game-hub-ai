import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Hall of Games crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            maxWidth: 480,
            margin: "4rem auto",
            padding: "2rem",
            textAlign: "center",
            background: "var(--bg-panel)",
            border: "1px solid var(--line-strong)",
            borderRadius: 14,
          }}
        >
          <h2 style={{ color: "var(--gold-hi)", marginBottom: "0.75rem" }}>
            Ada yang tidak beres
          </h2>
          <p style={{ marginBottom: "1.25rem" }}>
            Terjadi error tak terduga: <span className="mono">{this.state.error.message}</span>
          </p>
          <button
            onClick={() => {
              this.setState({ error: null });
              window.location.hash = "#/";
            }}
            style={{
              padding: "0.7rem 1.4rem",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(180deg, var(--gold-hi), var(--gold))",
              color: "#1a1406",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
            }}
          >
            Kembali ke Aula
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
