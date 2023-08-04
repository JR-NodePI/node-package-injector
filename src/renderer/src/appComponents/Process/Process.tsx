import { useContext, useState } from 'react';

import { Button, Icons, Modal, Spinner, ToasterListContext } from 'fratch-ui';
import { ToasterType } from 'fratch-ui/components/Toaster/ToasterConstants';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { ProcessService } from '../../services/ProcessService';
import useGlobalData from '../GlobalDataProvider/useGlobalData';

import styles from './Process.module.css';

export default function Process(): JSX.Element {
  const { addToaster } = useContext(ToasterListContext);
  const { activeTargetPackage, activeDependencies } = useGlobalData();

  const [isRunning, setIsRunning] = useState(false);
  const [isSyncing] = useState(false); //TODO: get from process
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useDeepCompareEffect(() => {
    (async (): Promise<void> => {
      if (isRunning) {
        const output = await ProcessService.run(
          activeTargetPackage,
          activeDependencies
        );

        setIsRunning(false);

        const hasErrors = output.some(({ error }) => !!error);
        output.forEach(({ title, content, error }) => {
          const type = error
            ? ToasterType.ERROR
            : hasErrors
            ? ToasterType.INFO
            : ToasterType.SUCCESS;
          const duration = type !== ToasterType.ERROR ? 3000 : 15000;
          addToaster({
            title,
            message: content || error || '',
            type,
            nlToBr: true,
            duration,
          });
        });
      }
    })();
  }, [isRunning, addToaster, activeTargetPackage, activeDependencies]);

  const handleRunClick = (): void => {
    setIsRunning(true);
  };

  const handleStopClick = (): void => {
    setIsRunning(false);
  };

  const processType = isSyncing ? 'secondary' : 'tertiary';
  const processMsg = isSyncing ? 'Syncing...' : 'Building...';

  const showRunButton =
    !isRunning &&
    activeTargetPackage?.isValidPackage &&
    activeDependencies?.every(d => d.isValidPackage);

  const showStopButton = isSyncing;

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
          Icon={Icons.IconPause}
          className={c(styles.stop_button)}
          label="Pause"
          type="secondary"
          onClick={handleStopClick}
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
