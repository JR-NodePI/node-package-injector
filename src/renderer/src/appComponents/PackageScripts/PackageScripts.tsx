import { useEffect, useState } from 'react';

import type TargetPackage from '@renderer/models/TargetPackage';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';

import { type PackageScript } from '../../models/PackageScriptsTypes';
import { PackageScriptRenderer } from './components/PackageScriptRenderer';
import {
  ADDITIONAL_PACKAGE_SCRIPTS,
  ADDITIONAL_PACKAGE_SCRIPTS_NAMES,
} from './PackageScriptsConstants';

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

  const [isYarn, setIsYarn] = useState<boolean>();

  useEffect(() => {
    (async (): Promise<void> => {
      setIsYarn(await NPMService.checkYarn(targetPackage.cwd ?? ''));
    })();
  }, [targetPackage.cwd]);

  const [selectedScrips, setSelectedScrips] = useState<PackageScript[]>(
    targetPackage.scripts.length ? targetPackage.scripts : []
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

      setScriptOptions(options);
    })();
  }, [targetPackage.cwd]);

  //add additional install script
  useEffect(() => {
    if (scriptOptions.length === 0 || isYarn == null) {
      return;
    }

    const hasAdditionalInstallScript = scriptOptions.some(
      ({ label }) =>
        label === ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL ||
        label === ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL
    );

    if (hasAdditionalInstallScript) {
      return;
    }

    const scriptName = isYarn
      ? ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL
      : ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL;

    setScriptOptions([
      {
        label: scriptName,
        value: ADDITIONAL_PACKAGE_SCRIPTS[scriptName],
      },
      ...scriptOptions,
    ]);
  }, [scriptOptions, selectedScrips, isYarn]);

  // try to determine the install and pack script
  useEffect(() => {
    if (selectedScrips.length === 0 && scriptOptions.length > 0) {
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
  }, [scriptOptions, selectedScrips]);

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
    <>
      {selectedScrips.map((script, index) => {
        const showAddButton =
          index === selectedScrips.length - 1 &&
          scriptOptions.length > selectedScrips.length;

        return (
          <PackageScriptRenderer
            key={`${index}-${script.scriptName}`}
            index={index}
            onAdd={handleAddScript}
            onChange={handleScriptChange}
            onRemove={handleRemoveScript}
            script={script}
            scriptOptions={noSelectedScriptOptions}
            showAddButton={showAddButton}
          />
        );
      })}
    </>
  );
}
