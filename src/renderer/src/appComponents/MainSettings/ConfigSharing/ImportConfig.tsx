import { ChangeEvent, useContext, useRef } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import PackageBunch from '@renderer/models/PackageBunch';
import { Button, ToasterListContext } from 'fratch-ui';
import { IconDownload } from 'fratch-ui/components/Icons/Icons';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import { v4 as uuid } from 'uuid';

import { getPackageBunchFromText } from './ConfigSharingHelpers';

import styles from './ImportConfig.module.css';

export default function ImportConfig(): JSX.Element {
  const { packageBunches, setIsGlobalLoading, setPackageBunch } =
    useGlobalData();
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

  const handleFileLoad = async (
    event: ProgressEvent<FileReader>
  ): Promise<void> => {
    if (!event.target?.result) return;

    setIsGlobalLoading?.(true);

    let importedBunch: PackageBunch | null = null;

    try {
      importedBunch = getPackageBunchFromText(event.target.result.toString());
      if (!importedBunch) {
        throw new Error('Malformed config file');
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
      importedBunch.id = uuid();
      importedBunch.active = true;

      await setPackageBunch?.([
        ...(packageBunches ?? []).map(bunch => {
          const clone = bunch.clone();
          clone.active = false;
          return clone;
        }),
        importedBunch,
      ]);
    }

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
