import { useContext, useState } from 'react';

import { Button, Icons, Modal, Spinner, ToasterListContext } from 'fratch-ui';
import { ToasterType } from 'fratch-ui/components/Toaster/ToasterConstants';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { RunProcessService } from '../../services/RunProcessService';
import useGlobalData from '../GlobalDataProvider/useGlobalData';

import styles from './RunProcess.module.css';

export default function RunProcess(): JSX.Element {
  const { addToaster } = useContext(ToasterListContext);
  const { activeTargetPackage, activeDependencies } = useGlobalData();

  const [isRunning, setIsRunning] = useState(false);
  const [isSyncing] = useState(false); //TODO: get from process
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [abortController, setAbortController] = useState<AbortController>();

  useDeepCompareEffect(() => {
    const mustRun =
      abortController?.signal != null && !abortController.signal.aborted;

    const run = async (): Promise<void> => {
      const output = await RunProcessService.run(
        activeTargetPackage,
        activeDependencies,
        abortController
      );

      setIsRunning(false);

      const hasErrors = output.some(({ error }) => !!error);
      output.forEach(({ title, content, error }, index) => {
        const type = error
          ? ToasterType.ERROR
          : hasErrors
          ? ToasterType.INFO
          : ToasterType.SUCCESS;
        const isError = type === ToasterType.ERROR;
        const duration = isError ? 15000 : 3000;
        addToaster({
          title,
          message: content || error || '',
          type,
          nlToBr: true,
          duration: duration + index * 200,
          stoppable: isError,
        });
      });
    };

    if (mustRun) {
      run();
    }

    return (): void => {
      if (mustRun) {
        abortController.abort();
      }
    };
  }, [
    isRunning,
    addToaster,
    activeTargetPackage,
    activeDependencies,
    abortController?.signal,
  ]);

  const handleRunClick = (): void => {
    setAbortController(new AbortController());
    setIsRunning(true);
  };

  const handleStopClick = (): void => {
    if (abortController?.signal != null) {
      abortController.abort();
    }
    setIsRunning(false);
  };

  const processType = isSyncing ? 'secondary' : 'tertiary';
  const processMsg = isSyncing ? 'Syncing...' : 'Building...';

  const showRunButton =
    !isRunning &&
    activeTargetPackage?.isValidPackage &&
    activeDependencies?.every(d => d.isValidPackage);

  const showStopButton = isRunning || isSyncing;

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
