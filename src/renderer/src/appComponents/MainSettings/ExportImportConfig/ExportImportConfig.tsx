import { ChangeEvent, useContext, useRef } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import PackageBunch from '@renderer/models/PackageBunch';
import { Button, ToasterListContext } from 'fratch-ui';
import { IconDownload, IconUpload } from 'fratch-ui/components/Icons/Icons';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import {
  downloadTextFile,
  parsePackageFromText,
} from './ExportImportConfigHelpers';

import styles from './ExportImportConfig.module.css';

export default function ExportImportConfig(): JSX.Element {
  const {
    activePackageBunch,
    packageBunches,
    setIsGlobalLoading,
    setPackageBunch,
  } = useGlobalData();
  const refInputFile = useRef<HTMLInputElement>(null);
  const { addToaster } = useContext(ToasterListContext);

  const handleExport = (): void => {
    downloadTextFile(JSON.stringify(activePackageBunch, null, 2), fileName);
  };

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

    let importedBunch: PackageBunch | undefined;

    try {
      importedBunch = parsePackageFromText(event.target.result as string);
      if (!importedBunch) {
        throw new Error('Invalid file');
      }
    } catch (error) {
      addToaster({
        type: 'error',
        message: (error as Error).message,
        duration: 2900,
      });
    }

    if (importedBunch) {
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

    setIsGlobalLoading?.(false);
  };

  const { name, id } = activePackageBunch;
  const fileName = `${name}-${id}.json`.replace(/\s+/g, '_');

  return (
    <div className={c(styles.export_import)}>
      <label title="Import configuration form json file">
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
      <label title="Export current package configuration">
        <Button
          onClick={handleExport}
          size="small"
          type="tertiary"
          stretch
          Icon={IconUpload}
        >
          Export
        </Button>
      </label>
    </div>
  );
}
