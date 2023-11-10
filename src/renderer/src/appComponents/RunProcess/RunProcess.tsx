import { useCallback, useContext, useState } from 'react';

import RunService, {
  ProcessServiceResponse,
} from '@renderer/services/RunService/RunService';
import SyncService from '@renderer/services/RunService/SyncService';
import {
  Button,
  IconPause,
  IconPlay,
  Spinner,
  ToasterListContext,
} from 'fratch-ui/components';
import { ToasterType } from 'fratch-ui/components/Toaster/ToasterConstants';
import { c } from 'fratch-ui/helpers';
import useDeepCompareEffect from 'use-deep-compare-effect';

import StartService from '../../services/RunService/StartService';
import useGlobalData from '../GlobalDataProvider/useGlobalData';

import styles from './RunProcess.module.css';
import BuildService from '@renderer/services/RunService/BuildService';

const STATUSES = {
  IDLE: { value: 'idle', label: 'Idle' } as const,
  FAILURE: { value: 'failure', label: 'Failure' } as const,
  SUCCESS: { value: 'success', label: 'Success' } as const,
  RUNNING: { value: 'running', label: 'Running' } as const,
  BUILDING: { value: 'building', label: 'Building' } as const,
  BUILDING_DEPENDENCIES: {
    value: 'building_dependencies',
    label: 'Building Dependencies',
  } as const,
  SYNCING: {
    value: 'syncing',
    label: 'Syncing',
  },
  AFTER_BUILD: {
    value: 'after_build',
    label: 'Running after build',
  } as const,
} as const;

type STATUS = (typeof STATUSES)[keyof typeof STATUSES];

export default function RunProcess(): JSX.Element {
  const { loading, isValidTerminal } = useGlobalData();

  const { addToaster } = useContext(ToasterListContext);
  const {
    additionalPackageScripts,
    activeTargetPackage,
    activeDependencies,
    isWSLActive,
  } = useGlobalData();

  const [status, setStatus] = useState<STATUS>(STATUSES.IDLE);
  const [abortController, setAbortController] =
    useState<AbortController | null>();
  const [syncAbortController, setSyncAbortController] =
    useState<AbortController | null>();

  const displayProcessMessages = useCallback(
    (output: ProcessServiceResponse[]): void => {
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

      setStatus(hasErrors ? STATUSES.FAILURE : STATUSES.SUCCESS);
    },
    [addToaster]
  );

  const handleAbort = useCallback((): void => {
    console.log('>>>----->> handleAbort');
  }, []);

  const handleAbortSync = useCallback(async (): Promise<void> => {
    const response = await SyncService.cleanSync({
      targetPackage: activeTargetPackage,
      abortController: new AbortController(),
    });

    if (response.error) {
      displayProcessMessages([response]);
    }
  }, [activeTargetPackage, displayProcessMessages]);

  useDeepCompareEffect(() => {
    const run = async (): Promise<void> => {
      const mustRun =
        abortController?.signal != null &&
        !abortController.signal.aborted &&
        syncAbortController?.signal != null &&
        !syncAbortController.signal.aborted;

      if (!mustRun) {
        return;
      }

      abortController.signal.addEventListener('abort', handleAbort);
      syncAbortController.signal.addEventListener('abort', handleAbortSync);

      setStatus(STATUSES.RUNNING);

      const output = await StartService.run({
        additionalPackageScripts,
        targetPackage: activeTargetPackage,
        dependencies: activeDependencies,
        abortController,
        syncAbortController,
        isWSLActive,
        onTargetBuildStart: () => {
          setStatus(STATUSES.BUILDING);
        },
        onDependenciesBuildStart: () => {
          setStatus(STATUSES.BUILDING_DEPENDENCIES);
        },
        onAfterBuildStart: () => {
          setStatus(STATUSES.AFTER_BUILD);
        },
        onDependenciesSyncStart: () => {
          setStatus(STATUSES.SYNCING);
        },
      });

      displayProcessMessages(output);
      setAbortController(null);
      setSyncAbortController(null);
    };

    run();

    return (): void => {
      abortController?.signal.removeEventListener('abort', handleAbort);
      abortController?.signal.removeEventListener('abort', handleAbortSync);
    };
  }, [
    handleAbort,
    handleAbortSync,
    abortController,
    activeDependencies,
    activeTargetPackage,
    additionalPackageScripts,
    displayProcessMessages,
    isWSLActive,
    syncAbortController,
  ]);

  const handleRunClick = (): void => {
    setAbortController(new AbortController());
    setSyncAbortController(new AbortController());
  };

  const handleStopClick = (): void => {
    abortController?.abort();
    syncAbortController?.abort();
    setStatus(STATUSES.IDLE);
    setAbortController(null);
    setSyncAbortController(null);
  };

  const handleStopSyncClick = (): void => {
    syncAbortController?.abort();
    setStatus(STATUSES.AFTER_BUILD);
    setSyncAbortController(null);
  };

  const processMsg = status.label;
  const isBuilding = (
    [
      STATUSES.AFTER_BUILD.value,
      STATUSES.BUILDING_DEPENDENCIES.value,
      STATUSES.RUNNING.value,
      STATUSES.BUILDING.value,
    ] as string[]
  ).includes(status.value);
  const isSyncing = status.value === STATUSES.SYNCING.value;

  const isRunning = isBuilding || isSyncing;

  const isRunEnabled =
    activeTargetPackage?.isValidPackage &&
    activeDependencies?.every(d => d.isValidPackage);

  if (loading || !isValidTerminal) {
    return <></>;
  }

  return (
    <>
      {isRunning && (
        <Spinner
          cover
          inverted={isSyncing}
          type={isSyncing ? 'primary' : 'secondary'}
          label={processMsg}
        />
      )}
      {!isRunning ? (
        <Button
          disabled={!isRunEnabled}
          Icon={IconPlay}
          className={c(styles.run_button)}
          label="Run"
          type="primary"
          onClick={handleRunClick}
        />
      ) : (
        <Button
          Icon={IconPause}
          className={c(styles.stop_button)}
          label="Pause"
          type={isSyncing ? 'tertiary' : 'secondary'}
          onClick={isSyncing ? handleStopSyncClick : handleStopClick}
        />
      )}
    </>
  );
}
