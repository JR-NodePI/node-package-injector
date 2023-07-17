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
import WSLService from './services/WSLService';

const useCheckNode = (): { loading: boolean; isValidNode: boolean } => {
  const [loading, setIsLoading] = useState<boolean>(true);
  const [isValidNode, setIsValid] = useState<boolean>(false);

  useEffect(() => {
    (async (): Promise<void> => {
      setIsValid(await NodeService.checkNodeNpmYarn());
      setIsLoading(false);
    })();
  }, []);

  return { loading, isValidNode };
};

const useDefaultPackageConfig = (): { loading: boolean; defaultPackageConfig: PackageConfig } => {
  const [loading, setIsLoading] = useState<boolean>(true);
  const [defaultPackageConfig, setDefaultPackageConfig] = useState<PackageConfig>(
    new PackageConfig()
  );

  useEffect(() => {
    (async (): Promise<void> => {
      const wslHomePath = await WSLService.getSWLHomePath(window.api.os.homedir());
      const newPackageConfig = defaultPackageConfig.clone();
      if (wslHomePath) {
        newPackageConfig.cwd = wslHomePath;
      } else {
        newPackageConfig.cwd = window.api.os.homedir();
      }
      setDefaultPackageConfig(newPackageConfig);
      setIsLoading(false);
    })();
  }, []);

  return { loading, defaultPackageConfig };
};

function App(): JSX.Element {
  const { loading: loadingCheckNode, isValidNode } = useCheckNode();

  const { loading: loadingDefaultPackageConfig, defaultPackageConfig } = useDefaultPackageConfig();

  const [mainPackageConfig, setMainPackageConfig] = usePersistedState<PackageConfig>(
    'mainPackageConfig',
    new PackageConfig(),
    PackageConfig
  );

  useEffect(() => {
    if (
      !loadingDefaultPackageConfig &&
      mainPackageConfig.cwd == null &&
      defaultPackageConfig.cwd != null
    ) {
      const clone = defaultPackageConfig.clone();
      setMainPackageConfig(clone);
    }
  }, [loadingDefaultPackageConfig, defaultPackageConfig, mainPackageConfig]);

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

  const isLoading = loadingCheckNode || loadingDefaultPackageConfig;

  return (
    <section className={c(styles.container)}>
      <Header
        iconPosition={window.electron.process.platform === 'darwin' ? 'right' : 'left'}
        title="Node Package Injector"
        iconSrc={logo}
      />
      {isLoading ? (
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
