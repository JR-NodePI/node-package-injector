import { createPortal } from 'react-dom';

import { Spinner } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import GlobalError from '../components/GlobalError/GlobalError';
import useGlobalData from './GlobalDataProvider/hooks/useGlobalData';
import MainSettings from './MainSettings/MainSettings';
import PackagePage from './PackagePage/PackagePage';
import PackagesTabsMenu from './PackagesTabsMenu/PackagesTabsMenu';

import styles from './Main.module.css';

function Main(): JSX.Element {
  const { loading, isValidTerminal, activePackageBunch } = useGlobalData();

  if (loading) {
    return createPortal(<Spinner cover />, document.body);
  }

  if (!isValidTerminal) {
    return (
      <GlobalError>
        <h3>Terminal error</h3>
      </GlobalError>
    );
  }

  return (
    <>
      <MainSettings className={c(styles.main_settings)} />
      <PackagesTabsMenu />
      <PackagePage key={activePackageBunch?.id} />
    </>
  );
}

export default Main;
