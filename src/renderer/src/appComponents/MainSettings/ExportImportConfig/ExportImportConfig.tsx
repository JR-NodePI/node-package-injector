import { ChangeEvent, useContext, useRef } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import PackageBunch from '@renderer/models/PackageBunch';
import TargetPackage from '@renderer/models/TargetPackage';
import { Button, ToasterListContext } from 'fratch-ui';
import { IconExport, IconImport } from 'fratch-ui/components/Icons/Icons';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './ExportImportConfig.module.css';

function downloadTextFile(text, name): void {
  const a = document.createElement('a');
  const type = name.split('.').pop();
  a.href = URL.createObjectURL(
    new Blob([text], { type: `text/${type === 'txt' ? 'plain' : type}` })
  );
  a.download = name;
  a.click();
}

function parseTextFile(text: string): PackageBunch {
  const newBunch = new PackageBunch();
  newBunch.targetPackage = new TargetPackage();

  const data = JSON.parse(text ?? '{}');

  newBunch.name = data.name;
  newBunch.color = data.color;

  if (data.targetPackage && data.targetPackage.cwd) {
    newBunch.targetPackage = data.targetPackage;
  }

  if (
    Array.isArray(data.dependencies) &&
    data.dependencies.every(({ cwd }) => cwd)
  ) {
    newBunch.dependencies = data.dependencies;
  }

  return newBunch;
}

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

    try {
      const newBunch = parseTextFile(event.target.result as string);
      newBunch.active = true;

      if (newBunch.name != null) {
        const newBunches = [
          ...(packageBunches ?? []).map(bunch => {
            const clone = bunch.clone();
            clone.active = false;
            return clone;
          }),
          newBunch,
        ];

        await setPackageBunch?.(newBunches);

        setTimeout(() => {
          window.electron.ipcRenderer.send('reload');
        }, 500);
      }
    } catch (error) {
      addToaster({ type: 'error', message: (error as Error).message });
    }
  };

  const { name, id } = activePackageBunch;
  const fileName = `${name}-${id}.json`.replace(/\s+/g, '_');

  return (
    <div className={c(styles.export_import)}>
      <label title="Import configuration form json file">
        <input type="file" ref={refInputFile} onChange={handleFileChange} />
        <Button onClick={handleImport} stretch size="small" Icon={IconImport}>
          Import
        </Button>
      </label>
      <label title="Export current package configuration">
        <Button onClick={handleExport} size="small" stretch Icon={IconExport}>
          Export
        </Button>
      </label>
    </div>
  );
}
