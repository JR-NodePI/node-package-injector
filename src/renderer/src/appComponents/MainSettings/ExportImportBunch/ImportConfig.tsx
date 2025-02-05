import { ChangeEvent, useContext, useRef } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import type PackageBunch from '@renderer/models/PackageBunch';
import type PackageScript from '@renderer/models/PackageScript';
import { Button, ToasterListContext } from 'fratch-ui/components';
import { IconDownload } from 'fratch-ui/components';
import { getRandomColor } from 'fratch-ui/helpers';
import { c } from 'fratch-ui/helpers';

import {
  getAdditionalScriptsFromText,
  getPackageBunchFromText,
} from './ExportImportBunchHelpers';

import styles from './ImportConfig.module.css';

export default function ImportConfig(): JSX.Element {
  const {
    additionalPackageScripts,
    isWSLActive,
    packageBunches,
    setAdditionalPackageScripts,
    setIsGlobalLoading,
    setPackageBunches,
  } = useGlobalData();
  const refInputFile = useRef<HTMLInputElement>(null);
  const { addToaster } = useContext(ToasterListContext);

  const handleImport = (): void => {
    refInputFile.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (!event.target.files) return;
    const reader = new FileReader();
    reader.onload = handleFileLoad;
    reader.readAsText(event.target.files[0]);
  };

  const handleFileLoadImportedBunch = async (
    fileContents: string
  ): Promise<void> => {
    let importedBunch: PackageBunch | null = null;

    try {
      importedBunch = await getPackageBunchFromText(fileContents, isWSLActive);
      if (!importedBunch) {
        throw new Error('Malformed config file for package bunch');
      }
    } catch (error) {
      addToaster({
        type: 'error',
        title: 'Import error',
        message: (error as Error).message,
        duration: 2900,
      });
    }

    if (importedBunch != null) {
      importedBunch.resetId();
      importedBunch.active = true;
      importedBunch.color = getRandomColor(
        packageBunches?.map(bunch => bunch.color) ?? []
      );

      await setPackageBunches?.([
        ...(packageBunches ?? []).map(bunch => {
          bunch.active = false;
          return bunch;
        }),
        importedBunch,
      ]);
    }
  };

  const handleFileLoadImportedAdditionalScripts = async (
    fileContents: string
  ): Promise<void> => {
    let additionalScripts: PackageScript[] | null = null;

    try {
      additionalScripts = await getAdditionalScriptsFromText(fileContents);
      if (!additionalScripts) {
        throw new Error('Malformed config file for additional scripts');
      }
    } catch (error) {
      addToaster({
        type: 'error',
        title: 'Import error',
        message: (error as Error).message,
        duration: 2900,
      });
    }

    if (additionalScripts != null) {
      const newScripts = additionalScripts.reduce(
        (tmpPackageScripts, newScript) => {
          const existingScript = additionalPackageScripts.find(
            ({ scriptValue }) => scriptValue === newScript.scriptValue
          );

          if (!existingScript) {
            return [newScript, ...tmpPackageScripts];
          }

          return tmpPackageScripts;
        },
        additionalPackageScripts
      );

      if (newScripts.length !== additionalPackageScripts.length) {
        setAdditionalPackageScripts?.(newScripts);
      }
    }
  };

  const handleFileLoad = async (
    event: ProgressEvent<FileReader>
  ): Promise<void> => {
    if (!event.target?.result) return;

    setIsGlobalLoading?.(true);

    const fileContents = event.target.result.toString();

    await handleFileLoadImportedBunch(fileContents);
    await handleFileLoadImportedAdditionalScripts(fileContents);

    if (refInputFile.current) {
      refInputFile.current.value = '';
    }

    setIsGlobalLoading?.(false);
  };

  return (
    <label
      className={c(styles.import_config)}
      title="Import configuration form json file"
    >
      <input type="file" ref={refInputFile} onChange={handleFileChange} />
      <Button
        onClick={handleImport}
        stretch
        size="small"
        type="tertiary"
        Icon={IconDownload}
      >
        Import
      </Button>
    </label>
  );
}
