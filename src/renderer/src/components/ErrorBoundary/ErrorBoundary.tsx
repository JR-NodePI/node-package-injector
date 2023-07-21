import { Component, type ReactNode } from 'react';

import GlobalError from '../GlobalError/GlobalError';

type ErrorBoundaryProps = {
  children?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps | Readonly<ErrorBoundaryProps>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo): void {
    // eslint-disable-next-line no-console
    console.error(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <GlobalError>
          <h3> Something went wrong.</h3>
        </GlobalError>
      );
    }

    return this.props.children;
  }
}
