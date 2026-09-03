import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { error: string | null };

export default class PageSafe extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error: error.message || "Something went wrong." };
  }

  componentDidCatch(error: Error) {
    console.warn("[page-safe]", error);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bd-earn-loading" style={{ padding: 24 }}>
          {this.state.error}
        </div>
      );
    }
    return this.props.children;
  }
}
