import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: Error | null };

export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
          <h2 className="text-lg font-semibold">Graph failed to render</h2>
          <p className="max-w-md text-sm text-zinc-400">
            {this.state.error.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
