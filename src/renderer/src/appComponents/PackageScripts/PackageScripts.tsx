import { useEffect, useState } from 'react';

import type TargetPackage from '@renderer/models/TargetPackage';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import { type PackageScript } from '../../models/PackageScriptsTypes';
import { PackageScriptRenderer } from './components/PackageScriptRenderer';

import styles from './PackageScripts.module.css';

const getScriptsHash = (scripts: PackageScript[]): string =>
  scripts
    .map(({ scriptName }) => scriptName)
    .filter(scriptName => Boolean(scriptName))
    .join('-');

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

  const [selectedScrips, setSelectedScrips] = useState<PackageScript[]>(
    targetPackage.scripts.length
      ? targetPackage.scripts
      : [{ scriptName: '', scriptValue: '' }]
  );

  // handle onChange when there is a change
  useEffect(() => {
    const initialHash = getScriptsHash(targetPackage.scripts);
    const selectedHash = getScriptsHash(selectedScrips);
    if (initialHash !== selectedHash) {
      onChange?.(selectedScrips);
    }
  }, [selectedScrips, targetPackage.scripts, onChange]);

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

      setScriptOptions(
        [
          ...options,
          {
            label: 'npm install --pure-lockfile',
            labelElement: <>🔗 npm install</>,
            value: {
              scriptName: 'npm install --pure-lockfile',
              scriptValue: 'npm install --pure-lockfile',
            },
          },
          {
            label: 'yarn install --pure-lock',
            labelElement: <>🔗 yarn install</>,
            value: {
              scriptName: 'yarn install --pure-lock',
              scriptValue: 'yarn install --pure-lock',
            },
          },
        ].sort((a, b) => a.label.localeCompare(b.label))
      );
    })();
  }, [targetPackage.cwd]);

  // try to determine the install and pack script
  useEffect(() => {
    if (targetPackage.scripts.length === 0) {
      //       const installScript = scriptOptions.find(
      //         ({ value }) =>
      //           / install/gi.test(value.scriptValue) &&
      //           !/prepare/gi.test(value.scriptName)
      //       );
      //
      //       if (installScript) {
      //         setSelectedScrips([installScript.value]);
      //       }
      //
      //       const packScript = scriptOptions.find(
      //         ({ value }) =>
      //           / pack /gi.test(value.scriptValue) ||
      //           / pack$/gi.test(value.scriptValue)
      //       );
      //
      //       if (packScript) {
      //         setSelectedScrips([
      //           ...(!installScript ? [{ scriptName: '', scriptValue: '' }] : []),
      //           packScript.value,
      //         ]);
      //       }
    }
  }, [scriptOptions, targetPackage.scripts]);

  const handleAddScript = (): void => {
    setSelectedScrips([...selectedScrips, { scriptName: '', scriptValue: '' }]);
  };

  const handleRemoveScript = (indexToRemove: number): void => {
    const newScripts = selectedScrips.filter(
      (_script, index) => index !== indexToRemove
    );
    setSelectedScrips(
      newScripts.length > 0 ? newScripts : [{ scriptName: '', scriptValue: '' }]
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

  const noSelectedScriptOptions = scriptOptions.filter(({ value }) =>
    selectedScrips.every(({ scriptName }) => scriptName !== value.scriptName)
  );

  return (
    <div className={c(styles.package_scripts)}>
      {selectedScrips.map((script, index) => {
        const showAddButton =
          index === selectedScrips.length - 1 &&
          scriptOptions.length > selectedScrips.length;

        return (
          <PackageScriptRenderer
            index={index}
            key={index}
            onAdd={handleAddScript}
            onChange={handleScriptChange}
            onRemove={handleRemoveScript}
            script={script}
            scriptOptions={noSelectedScriptOptions}
            showAddButton={showAddButton}
          />
        );
      })}
    </div>
  );
}
