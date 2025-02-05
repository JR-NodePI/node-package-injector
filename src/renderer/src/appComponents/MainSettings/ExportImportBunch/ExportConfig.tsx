import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import { Button } from 'fratch-ui/components';
import { IconUpload } from 'fratch-ui/components';

import { downloadTextFile } from './ExportImportBunchHelpers';

export default function ExportConfig(): JSX.Element {
  const { activePackageBunch, isWSLActive, additionalPackageScripts } =
    useGlobalData();

  const handleExport = (): void => {
    downloadTextFile(
      JSON.stringify(
        {
          activePackageBunch,
          additionalPackageScripts,
        },
        null,
        2
      ),
      fileName,
      isWSLActive
    );
  };

  const { name, id } = activePackageBunch;
  const fileName = `${name}-${id}.json`.replace(/\s+/g, '_');

  return (
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
  );
}
