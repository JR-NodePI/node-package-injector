import { useEffect, useState } from 'react';

import type TargetPackage from '@renderer/models/TargetPackage';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import { type PackageScript } from '../../models/PackageScriptsTypes';
import { PackageScriptRenderer } from './components/PackageScriptRenderer';

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

  // try to determine the install and pack script
  useEffect(() => {
    if (targetPackage.scripts.length === 0) {
      const installScript = scriptOptions.find(
        ({ value }) =>
          / install/gi.test(value.scriptValue) &&
          !/prepare/gi.test(value.scriptName)
      );

      if (installScript) {
        setSelectedScrips([installScript.value]);
      }

      const packScript = scriptOptions.find(
        ({ value }) =>
          / pack /gi.test(value.scriptValue) ||
          / pack$/gi.test(value.scriptValue)
      );

      if (packScript) {
        setSelectedScrips([
          ...(!installScript ? [{ scriptName: '', scriptValue: '' }] : []),
          packScript.value,
        ]);
      }
    }
  }, [scriptOptions, targetPackage.scripts]);

  const [selectedScrips, setSelectedScrips] = useState<PackageScript[]>(
    targetPackage.scripts
  );

  useEffect(() => {
    if (!selectedScrips.length) {
      setSelectedScrips([{ scriptName: '', scriptValue: '' }]);
    }
  }, [selectedScrips]);

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
    modifiedScriptIndex: number,
    modifiedScript?: PackageScript
  ): void => {
    setSelectedScrips(
      selectedScrips.map((script, index) =>
        index === modifiedScriptIndex
          ? modifiedScript ?? {
              scriptName: '',
              scriptValue: '',
            }
          : script
      )
    );
  };

  const noSelectedScriptOptions = scriptOptions.filter(({ label }) =>
    selectedScrips.every(({ scriptName }) => scriptName !== label)
  );

  return (
    <div className={c(styles.package_scripts)}>
      {selectedScrips.map((script, index) => (
        <PackageScriptRenderer
          index={index}
          key={index}
          onAdd={handleAddScript}
          onChange={handleScriptChange}
          onRemove={handleRemoveScript}
          script={script}
          scriptOptions={noSelectedScriptOptions}
          showAddButton={index === selectedScrips.length - 1}
        />
      ))}
    </div>
  );
}
