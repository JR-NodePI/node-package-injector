import { ToasterProvider } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import GlobalDataProvider from './components/GlobalDataProvider/GlobalDataProvider';
import Layout from './components/Layout/Layout';
import Main from './components/Main/Main';

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
