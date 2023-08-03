import { useEffect, useState } from 'react';

import type TargetPackage from '@renderer/models/TargetPackage';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import { type PackageScript } from '../../models/PackageScriptsTypes';
import PackageScriptSelector from './PackageScriptSelector';

import styles from './PackageScripts.module.css';

export default function PackageScripts({
  targetPackage,
  onChange,
}: {
  targetPackage: TargetPackage;
  onChange?: (scripts: PackageScript[]) => void;
}): JSX.Element {
  const [scriptOptions, setScriptOptions] = useState<
    Form.SelectProps.SelectOption<PackageScript>[]
  >([]);

  // load package scripts
  useEffect(() => {
    (async (): Promise<void> => {
      const scripts = await NPMService.getPackageScripts(
        targetPackage.cwd ?? ''
      );
      const options = Object.entries(scripts).map(
        ([scriptName, scriptValue]) => ({
          value: { scriptName, scriptValue },
          label: scriptName,
        })
      );
      setScriptOptions(options);
    })();
  }, [targetPackage.cwd]);

  const [selectedScrips, setSelectedScrips] = useState<PackageScript[]>(
    targetPackage.scripts
  );

  useEffect(() => {
    const initialHash = targetPackage.scripts
      .map(({ scriptName }) => scriptName)
      .join('-');
    const selectedHash = selectedScrips
      .map(({ scriptName }) => scriptName)
      .join('-');
    if (initialHash !== selectedHash) {
      onChange?.(selectedScrips);
    }
  }, [selectedScrips, targetPackage.scripts, onChange]);

  const handleAddScript = (): void => {
    setSelectedScrips([...selectedScrips, { scriptName: '', scriptValue: '' }]);
  };

  const handleRemoveScript = (indexToRemove: number): void => {
    setSelectedScrips(
      selectedScrips.filter((_script, index) => index !== indexToRemove)
    );
  };

  const handleScriptChange = (
    modifiedScript: PackageScript,
    modifiedScriptIndex: number
  ): void => {
    setSelectedScrips(
      selectedScrips.map((script, index) =>
        index === modifiedScriptIndex ? modifiedScript : script
      )
    );
  };

  const scriptOptionsWithoutSelected = scriptOptions.filter(({ label }) =>
    selectedScrips.every(({ scriptName }) => scriptName !== label)
  );

  return (
    <div className={c(styles.package_scripts)}>
      {selectedScrips.map((script, index) => (
        <div key={index}>
          <PackageScriptSelector
            label={`${index + 1}º package script`}
            selectedScript={script}
            scriptOptions={scriptOptionsWithoutSelected}
            onChange={(script): void => {
              handleScriptChange(script, index);
            }}
            additionalComponent={
              <button
                onClick={(): void => handleRemoveScript(index)}
                title="Remove package script"
              >
                del -
              </button>
            }
          />
        </div>
      ))}
      <button onClick={handleAddScript} title="Add an package script">
        add +
      </button>
    </div>
  );
}
