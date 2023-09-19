import { useEffect, useState } from 'react';

import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';

import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageScript from '@renderer/models/PackageScript';
import NodeService from '@renderer/services/NodeService';

import { PackageScriptRenderer } from './components/PackageScriptRenderer';
import {
  ADDITIONAL_PACKAGE_SCRIPTS,
  ADDITIONAL_PACKAGE_SCRIPTS_NAMES,
} from './PackageScriptsConstants';

type PackageScriptOption = SelectOption<PackageScript>;

const getScriptsHash = (scripts: PackageScript[] = []): string =>
  scripts
    .map(({ scriptName }) => scriptName)
    .filter(scriptName => Boolean(scriptName))
    .join('-');

export default function PackageScripts({
  nodePackage,
  onChange,
}: {
  nodePackage: NodePackage;
  onChange?: (scripts: PackageScript[]) => void;
}): JSX.Element {
  const [scriptOptions, setScriptOptions] = useState<PackageScriptOption[]>([]);
  const [selectedScrips, setSelectedScrips] = useState<
    PackageScript[] | undefined
  >(nodePackage.scripts);
  const [isYarn, setIsYarn] = useState<boolean>();
  const [isPnpm, setIsPnpm] = useState<boolean>();
  useEffect(() => {
    (async (): Promise<void> => {
      setIsPnpm(await NodeService.checkPnpm(nodePackage.cwd ?? ''));
      setIsYarn(await NodeService.checkYarn(nodePackage.cwd ?? ''));
    })();
  }, [nodePackage.cwd]);

  // handle onChange when there is a change
  useEffect(() => {
    const initialHash = getScriptsHash(nodePackage.scripts);
    const selectedHash = getScriptsHash(selectedScrips);
    if (Array.isArray(selectedScrips) && initialHash !== selectedHash) {
      onChange?.(selectedScrips);
    }
  }, [selectedScrips, nodePackage.scripts, onChange]);

  // load package scripts
  useEffect(() => {
    (async (): Promise<void> => {
      const scripts = await NodeService.getPackageScripts(
        nodePackage.cwd ?? ''
      );

      const options = Object.entries(scripts).map(
        ([scriptName, scriptValue]) => ({
          value: new PackageScript(scriptName, scriptValue),
          label: scriptName,
        })
      );

      setScriptOptions(options);
    })();
  }, [nodePackage.cwd]);

  //add additional install script
  useEffect(() => {
    if (scriptOptions.length === 0 || (isYarn == null && isPnpm == null)) {
      return;
    }

    const hasAdditionalInstallScript = scriptOptions.some(
      ({ label }) =>
        label === ADDITIONAL_PACKAGE_SCRIPTS_NAMES.PNPM_INSTALL ||
        label === ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL ||
        label === ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL
    );

    if (hasAdditionalInstallScript) {
      return;
    }

    const scriptName = isPnpm
      ? ADDITIONAL_PACKAGE_SCRIPTS_NAMES.PNPM_INSTALL
      : isYarn
      ? ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL
      : ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL;

    setScriptOptions([
      {
        label: scriptName,
        value: ADDITIONAL_PACKAGE_SCRIPTS[scriptName],
      },
      ...scriptOptions,
    ]);
  }, [scriptOptions, selectedScrips, isYarn, isPnpm]);

  // try to determine the install and pack script
  useEffect(() => {
    (async (): Promise<void> => {
      if (selectedScrips == null && scriptOptions.length > 0) {
        const installScript = scriptOptions.find(
          ({ value }) =>
            / install/gi.test(value.scriptValue) &&
            !/prepare/gi.test(value.scriptName)
        );

        const scripts: PackageScript[] = [];

        if (installScript) {
          scripts.push(installScript.value);
        } else {
          scripts.push(new PackageScript());
        }

        if (nodePackage instanceof DependencyPackage) {
          const packScript = scriptOptions.find(
            ({ value }) =>
              / pack /gi.test(value.scriptValue) ||
              / pack$/gi.test(value.scriptValue)
          );

          if (packScript) {
            scripts.push(packScript.value);
          }
        }

        if (scripts.length > 0) {
          await setSelectedScrips(scripts);
        }
      }
    })();
  }, [scriptOptions, selectedScrips, nodePackage]);

  const handleAddScript = (): void => {
    setSelectedScrips([...(selectedScrips ?? []), new PackageScript()]);
  };

  const handleRemoveScript = (indexToRemove: number): void => {
    const newScripts =
      selectedScrips?.filter((_script, index) => index !== indexToRemove) ?? [];
    setSelectedScrips(
      newScripts.length > 0 ? newScripts : [new PackageScript()]
    );
  };

  const handleScriptChange = (
    modifiedScriptIndex: number,
    modifiedScript?: PackageScript
  ): void => {
    setSelectedScrips(
      selectedScrips?.map((script, index) =>
        index === modifiedScriptIndex
          ? modifiedScript ?? new PackageScript()
          : script.clone()
      )
    );
  };

  const noSelectedScriptOptions = scriptOptions.filter(({ value }) =>
    selectedScrips?.every(({ scriptName }) => scriptName !== value.scriptName)
  );

  const scriptsToRender =
    selectedScrips != null && selectedScrips.length > 0
      ? selectedScrips
      : [new PackageScript()];

  return (
    <>
      {scriptsToRender.map((script, index) => {
        const showAddButton =
          index === scriptsToRender.length - 1 &&
          scriptOptions.length > scriptsToRender.length;

        return (
          <PackageScriptRenderer
            key={`${script.id}-${script.scriptName}`}
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
