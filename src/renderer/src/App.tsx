import { ToasterProvider } from 'fratch-ui';
import CheckTerminalProvider from './components/CheckTerminalProvider/CheckTerminalProvider';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Main from './components/Main/Main';

export default function App(): JSX.Element {
  return (
    <CheckTerminalProvider>
      <Layout>
        <ErrorBoundary>
          <ToasterProvider>
            <Main />
          </ToasterProvider>
        </ErrorBoundary>
      </Layout>
    </CheckTerminalProvider>
  );
}
