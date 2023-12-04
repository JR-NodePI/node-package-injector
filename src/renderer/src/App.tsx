import {
  ColorSchemeProvider,
  ModalProvider,
  ToasterProvider,
} from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import FormValidationProvider from './appComponents/FormValidation/FormValidationProvider';
import GlobalDataProvider from './appComponents/GlobalDataProvider/GlobalDataProvider';
import Main from './appComponents/Main';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Layout from './components/Layout/Layout';

import styles from './App.module.css';

export default function App(): JSX.Element {
  return (
    <ErrorBoundary>
      <ColorSchemeProvider>
        <GlobalDataProvider>
          <FormValidationProvider>
            <ModalProvider>
              <ToasterProvider listClassName={c(styles.toaster_list)}>
                <Layout>
                  <Main />
                </Layout>
              </ToasterProvider>
            </ModalProvider>
          </FormValidationProvider>
        </GlobalDataProvider>
      </ColorSchemeProvider>
    </ErrorBoundary>
  );
}
