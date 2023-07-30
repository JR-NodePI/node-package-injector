import { useContext, useEffect, useState } from 'react';

import { Button, Icons, Modal, Spinner, ToasterListContext } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';

import styles from './Process.module.css';

export default function Process(): JSX.Element {
  const { addToaster } = useContext(ToasterListContext);
  const { activePackageConfig, activeDependencies } = useGlobalData();
  const [isRunning, setIsRunning] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false); //TODO: get from process
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    if (isRunning) {
      setTimeout(() => {
        setIsSyncing(!isSyncing);
      }, 2000); // TODO: remove this simulation process
    } else {
      setIsSyncing(false);
    }
  }, [isSyncing, isRunning]);

  useEffect(() => {
    let timerId;
    if (isRunning) {
      timerId = setTimeout(() => {
        setIsRunning(false);
        setShowSuccessMessage(true);
      }, 5000); // TODO: remove this simulation process
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isRunning, addToaster]);

  const handleRunClick = (): void => {
    setIsRunning(true);
  };

  const handleCloseClick = (): void => {
    setIsRunning(false);
  };

  const showRunButton =
    activePackageConfig?.isValidPackage &&
    activeDependencies &&
    activeDependencies?.length > 0 &&
    activeDependencies?.every(d => d.isValidPackage) &&
    !isRunning;

  const showStopButton = isRunning;

  const processType = isSyncing ? 'secondary' : 'tertiary';
  const processMsg = isSyncing ? 'Syncing...' : 'Building...';

  return (
    <>
      {isRunning && (
        <Spinner
          cover
          inverted={isSyncing}
          type={processType}
          label={processMsg}
        />
      )}
      {showRunButton && (
        <Button
          Icon={Icons.IconPlay}
          className={c(styles.run_button)}
          label="Run"
          type="primary"
          onClick={handleRunClick}
        />
      )}
      {showStopButton && (
        <Button
          disabled={!isSyncing}
          Icon={Icons.IconPause}
          className={c(styles.stop_button)}
          label="Pause"
          type="secondary"
          onClick={handleCloseClick}
        />
      )}
      <Modal
        visible={showSuccessMessage}
        type="info"
        onClose={(): void => setShowSuccessMessage(false)}
        title="Success!!!"
      >
        Running finished successfully!
      </Modal>
    </>
  );
}
