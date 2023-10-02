import { ColorSchemeProvider, ModalProvider, ToasterProvider } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import GlobalDataProvider from './appComponents/GlobalDataProvider/GlobalDataProvider';
import Main from './appComponents/Main';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';

import styles from './App.module.css';

export default function App(): JSX.Element {
  return (
    <ColorSchemeProvider>
      <GlobalDataProvider>
        <ModalProvider>
          <ToasterProvider listClassName={c(styles.toaster_list)}>
            <Layout>
              <ErrorBoundary>
                <Main />
              </ErrorBoundary>
            </Layout>
          </ToasterProvider>
        </ModalProvider>
      </GlobalDataProvider>
    </ColorSchemeProvider>
  );
}
