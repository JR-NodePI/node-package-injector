import { ToasterProvider } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import GlobalDataProvider from './App/GlobalDataProvider/GlobalDataProvider';
import Main from './App/Main';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';

import styles from './App.module.css';

export default function App(): JSX.Element {
  return (
    <GlobalDataProvider>
      <ToasterProvider listClassName={c(styles.toaster_list)}>
        <Layout>
          <ErrorBoundary>
            <Main />
          </ErrorBoundary>
        </Layout>
      </ToasterProvider>
    </GlobalDataProvider>
  );
}
