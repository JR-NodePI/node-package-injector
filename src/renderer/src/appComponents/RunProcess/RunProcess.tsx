import { useCallback, useContext, useState } from 'react';

import type PackageBunch from '@renderer/models/PackageBunch';
import RunService, {
  ProcessServiceResponse,
} from '@renderer/services/RunService/RunService';
import {
  Button,
  IconClose,
  IconPlay,
  Spinner,
  ToasterListContext,
} from 'fratch-ui/components';
import { ToasterType } from 'fratch-ui/components/Toaster/ToasterConstants';
import { c } from 'fratch-ui/helpers';
import useDeepCompareEffect from 'use-deep-compare-effect';

import StartService from '../../services/RunService/StartService';
import useFormValidation from '../FormValidation/useFormValidation';
import useGlobalData from '../GlobalDataProvider/useGlobalData';

import styles from './RunProcess.module.css';

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
  const form = useFormValidation();

  const { loading, isValidTerminal } = useGlobalData();

  const { addToaster } = useContext(ToasterListContext);
  const { activePackageBunch, additionalPackageScripts } = useGlobalData();

  const [status, setStatus] = useState<STATUS>(STATUSES.IDLE);

  const [runActivePackageBunch, setRunActivePackageBunch] =
    useState<PackageBunch | null>();

  const [abortController, setAbortController] =
    useState<AbortController | null>();
  const [syncAbortController, setSyncAbortController] =
    useState<AbortController | null>();

  const displayProcessMessages = useCallback(
    (output: ProcessServiceResponse[]): void => {
      const hasErrors = RunService.hasError(output);
      output.forEach(({ title, content, error }, index) => {
        const isAbort = `${title ?? ''}${content ?? ''}${error ?? ''}`
          .toLowerCase()
          .includes('aborted');

        const type = isAbort
          ? ToasterType.WARNING
          : error
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

  useDeepCompareEffect(() => {
    const handleAbort = async (): Promise<void> => {
      await RunService.resetKillAll();
    };

    const run = async (): Promise<void> => {
      const mustRun =
        runActivePackageBunch != null &&
        abortController?.signal != null &&
        !abortController.signal.aborted &&
        syncAbortController?.signal != null &&
        !syncAbortController.signal.aborted;

      if (!mustRun) {
        return;
      }

      abortController.signal.addEventListener('abort', handleAbort);

      setStatus(STATUSES.RUNNING);

      const output = await StartService.run({
        additionalPackageScripts,
        targetPackage: runActivePackageBunch.targetPackage,
        dependencies: runActivePackageBunch.dependencies,
        abortController,
        syncAbortController,
        onTargetBuildStart: () => {
          setStatus(STATUSES.BUILDING);
        },
        onDependenciesBuildStart: () => {
          setStatus(STATUSES.BUILDING_DEPENDENCIES);
        },
        onDependenciesSyncStart: () => {
          setStatus(STATUSES.SYNCING);
        },
        onAfterBuildStart: () => {
          setStatus(STATUSES.AFTER_BUILD);
        },
      });

      displayProcessMessages(output);
      setAbortController(null);
      setSyncAbortController(null);
      setStatus(STATUSES.IDLE);
    };

    run();

    return (): void => {
      abortController?.signal.removeEventListener('abort', handleAbort);
    };
  }, [
    abortController,
    additionalPackageScripts,
    displayProcessMessages,
    runActivePackageBunch,
    syncAbortController,
  ]);

  const handleRunClick = async (): Promise<void> => {
    const isValid = await form.validate?.();
    if (!isValid) {
      return;
    }

    setRunActivePackageBunch(activePackageBunch);
    setAbortController(new AbortController());
    setSyncAbortController(new AbortController());
  };

  const handleStopClick = (): void => {
    abortController?.abort();
    syncAbortController?.abort();

    setRunActivePackageBunch(null);
    setAbortController(null);
    setSyncAbortController(null);
  };

  const processMsg = status.label;
  const isBuilding = (
    [
      STATUSES.BUILDING_DEPENDENCIES.value,
      STATUSES.RUNNING.value,
      STATUSES.BUILDING.value,
    ] as string[]
  ).includes(status.value);
  const isAfterBuilding = status.value === STATUSES.AFTER_BUILD.value;
  const isSyncing = status.value === STATUSES.SYNCING.value;

  const isRunning = isAfterBuilding || isBuilding || isSyncing;
  const isSpinning =
    isRunning && runActivePackageBunch?.id === activePackageBunch.id;

  const isRunEnabled =
    activePackageBunch.targetPackage?.isValidPackage &&
    activePackageBunch.dependencies?.every(d => d.isValidPackage);

  if (loading || !isValidTerminal) {
    return <></>;
  }

  return (
    <>
      {isSpinning && (
        <Spinner
          cover
          inverted={isSyncing}
          type={isSyncing ? 'primary' : 'secondary'}
          label={processMsg}
          className={c(styles.run_process_spinner)}
        />
      )}
      {isRunning ? (
        <>
          {!isSpinning && (
            <p className={c(styles.mini_run_summary)}>
              <span
                className={c(styles.mini_run_summary_bullet)}
                style={{ backgroundColor: runActivePackageBunch?.color }}
              ></span>
              {runActivePackageBunch?.name}: <i>{processMsg}</i>
            </p>
          )}
          <Button
            size="small"
            Icon={IconClose}
            className={c(styles.stop_button)}
            label="Stop"
            type={isSyncing ? 'tertiary' : 'secondary'}
            onClick={handleStopClick}
          />
        </>
      ) : (
        <Button
          size="small"
          disabled={!isRunEnabled}
          Icon={IconPlay}
          className={c(styles.run_button)}
          label="Run"
          type="primary"
          onClick={handleRunClick}
        />
      )}
    </>
  );
}
