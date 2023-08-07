import { createPortal } from 'react-dom';

import { Spinner } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import GlobalError from '../components/GlobalError/GlobalError';
import useGlobalData from './GlobalDataProvider/useGlobalData';
import MainSettings from './MainSettings/MainSettings';
import NodeInfo from './NodeInfo/NodeInfo';
import PackageBunchPage from './PackageBunchPage/PackageBunchPage';
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
      <NodeInfo />
      <MainSettings className={c(styles.main_settings)} />
      <PackagesTabsMenu />
      <PackageBunchPage key={activePackageBunch?.id} />
    </>
  );
}

export default Main;
