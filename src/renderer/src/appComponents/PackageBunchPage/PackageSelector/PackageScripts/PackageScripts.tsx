import { useEffect, useState } from 'react';

import PackageScript from '@renderer/models/PackageScript';
import NodeService from '@renderer/services/NodeService/NodeService';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';

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
  cwd = '',
  initialScripts,
  onChange,
  findInstallScript,
  findBuildScript,
}: {
  cwd?: string;
  initialScripts?: PackageScript[];
  onChange?: (scripts: PackageScript[]) => void;
  findInstallScript?: boolean;
  findBuildScript?: boolean;
}): JSX.Element {
  const [scriptOptions, setScriptOptions] = useState<PackageScriptOption[]>([]);
  const [selectedScrips, setSelectedScrips] = useState<PackageScript[]>(
    initialScripts ?? []
  );

  const [isYarn, setIsYarn] = useState<boolean>();
  const [isPnpm, setIsPnpm] = useState<boolean>();
  useEffect(() => {
    (async (): Promise<void> => {
      setIsPnpm(await NodeService.checkPnpm(cwd ?? ''));
      setIsYarn(await NodeService.checkYarn(cwd ?? ''));
    })();
  }, [cwd]);

  // handle onChange when there is a change
  const nodePackageScriptsHash = getScriptsHash(initialScripts);
  const selectedScripsHash = getScriptsHash(selectedScrips);
  useEffect(() => {
    if (
      Array.isArray(selectedScrips) &&
      nodePackageScriptsHash !== selectedScripsHash
    ) {
      onChange?.(selectedScrips);
    }
  }, [nodePackageScriptsHash, onChange, selectedScrips, selectedScripsHash]);

  // load package scripts
  useEffect(() => {
    (async (): Promise<void> => {
      const scripts = await NodeService.getPackageScripts(cwd ?? '');

      const options = Object.entries(scripts).map(
        ([scriptName, scriptValue]) => ({
          value: new PackageScript(scriptName, scriptValue),
          label: scriptName,
        })
      );
      setScriptOptions(options);
    })();
  }, [cwd]);

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
  }, [scriptOptions, isYarn, isPnpm]);

  // try to determine the install and pack script
  useEffect(() => {
    (async (): Promise<void> => {
      if (initialScripts == null && scriptOptions.length > 0) {
        const installScript = findInstallScript
          ? scriptOptions.find(
              ({ label, value }) =>
                ADDITIONAL_PACKAGE_SCRIPTS[label] == null &&
                / install/gi.test(value.scriptValue) &&
                !/prepare/gi.test(value.scriptName)
            )
          : undefined;

        const scripts: PackageScript[] = [];

        if (installScript) {
          scripts.push(installScript.value);
        } else {
          scripts.push(new PackageScript());
        }

        if (findBuildScript) {
          const buildScript = scriptOptions.find(
            ({ value }) =>
              / pack /gi.test(value.scriptValue) ||
              / pack$/gi.test(value.scriptValue)
          );

          if (buildScript) {
            scripts.push(buildScript.value);
          }
        }

        if (scripts.length > 0) {
          await setSelectedScrips(scripts);
        }
      }
    })();
  }, [scriptOptions, initialScripts, findInstallScript, findBuildScript]);

  const handleAddScript = (): void => {
    setSelectedScrips([...selectedScrips, new PackageScript()]);
  };

  const handleRemoveScript = (indexToRemove: number): void => {
    const newScripts =
      selectedScrips.filter((_script, index) => index !== indexToRemove) ?? [];
    setSelectedScrips(
      newScripts.length > 0 ? newScripts : [new PackageScript()]
    );
  };

  const handleScriptChange = (
    modifiedScriptIndex: number,
    modifiedScript?: PackageScript
  ): void => {
    setSelectedScrips(
      selectedScrips.map((script, index) =>
        index === modifiedScriptIndex
          ? modifiedScript ?? new PackageScript()
          : script.clone()
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
