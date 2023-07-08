import { c } from 'fratch-ui/helpers/classNameHelpers';
import { Header, Spinner } from 'fratch-ui';
import { useEffect, useState } from 'react';
import logo from './assets/logo.png';

import styles from './App.module.css';

import PackageSelector from './components/PackageSelector/PackageSelector';
import Footer from './components/Footer/Footer';
import NodeService from './services/NodeService';
import Dependencies from './components/Dependencies/Dependencies';
import usePersistedState from './hooks/usePersistedState';
import PackageConfig from './models/PackageConfig';

const defaultPackageConfig = new PackageConfig();
defaultPackageConfig.cwd = window.electron.process.env.HOME ?? '/';

const useCheckNode = (): { loadingCheckNode: boolean; isValidNode: boolean } => {
  const [loadingCheckNode, setIsLoading] = useState<boolean>(true);
  const [isValidNode, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    (async (): Promise<void> => {
      setIsValid(await NodeService.checkNodeNpmYarn());
      setIsLoading(false);
    })();
  }, []);

  return { loadingCheckNode, isValidNode };
};

function App(): JSX.Element {
  const { loadingCheckNode, isValidNode } = useCheckNode();

  const [mainPackageConfig, setMainPackageConfig] = usePersistedState<PackageConfig>(
    'mainPackageConfig',
    defaultPackageConfig,
    PackageConfig
  );

  const handlePathChange = (cwd: string, isValidPackage): void => {
    const clone = mainPackageConfig.clone();
    clone.cwd = cwd;
    clone.isValidPackage = isValidPackage;
    setMainPackageConfig(clone);
  };

  const handleBranchChange = (branch?: string): void => {
    const clone = mainPackageConfig.clone();
    clone.branch = branch;
    setMainPackageConfig(clone);
  };

  const handleGitPullChange = (checked: boolean): void => {
    const clone = mainPackageConfig.clone();
    clone.performGitPull = checked;
    setMainPackageConfig(clone);
  };

  const handleYarnInstallChange = (checked: boolean): void => {
    const clone = mainPackageConfig.clone();
    clone.performYarnInstall = checked;
    setMainPackageConfig(clone);
  };

  return (
    <section className={c(styles.container)}>
      <Header
        iconPosition={window.electron.process.platform === 'darwin' ? 'right' : 'left'}
        title="Node Package Injector"
        iconSrc={logo}
      />
      {loadingCheckNode ? (
        <Spinner />
      ) : isValidNode ? (
        <>
          <div className={c(styles.content)}>
            <h2>Target</h2>
            <PackageSelector
              packageConfig={mainPackageConfig}
              onPathChange={handlePathChange}
              onBranchChange={handleBranchChange}
              onGitPullChange={handleGitPullChange}
              onYarnInstallChange={handleYarnInstallChange}
            />
            <Dependencies mainPackageConfig={mainPackageConfig} />
          </div>
        </>
      ) : (
        <p className={c(styles.invalid_node)}>Invalid NodeJS</p>
      )}
      <Footer isValidNode={isValidNode} />
    </section>
  );
}

export default App;
