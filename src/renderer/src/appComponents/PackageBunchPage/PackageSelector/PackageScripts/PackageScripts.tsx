import { useEffect, useState } from 'react';

import PackageScript from '@renderer/models/PackageScript';
import NodeService from '@renderer/services/NodeService/NodeService';
import DragAndDropSorter from 'fratch-ui/components/DragAndDropSorter/DragAndDropSorter';
import {
  DraggableItem,
  SortedDraggableItem,
} from 'fratch-ui/components/DragAndDropSorter/DragAndDropSorterProps';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';

import { PackageScriptRenderer } from './components/PackageScriptRenderer';
import {
  ADDITIONAL_COMMON_PACKAGE_SCRIPTS,
  ADDITIONAL_PACKAGE_SCRIPTS,
  ADDITIONAL_PACKAGE_SCRIPTS_NAMES,
} from './PackageScriptsConstants';

type PackageScriptOption = SelectOption<PackageScript>;

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
  const currentScripts = initialScripts ?? [];
  const [scriptOptions, setScriptOptions] = useState<PackageScriptOption[]>([]);

  useEffect(() => {
    if (currentScripts.length === 0) {
      onChange?.([new PackageScript()]);
    }
  }, [onChange, currentScripts.length]);

  const [isYarn, setIsYarn] = useState<boolean>();
  const [isPnpm, setIsPnpm] = useState<boolean>();
  useEffect(() => {
    (async (): Promise<void> => {
      setIsPnpm(await NodeService.checkPnpm(cwd ?? ''));
      setIsYarn(await NodeService.checkYarn(cwd ?? ''));
    })();
  }, [cwd]);

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

    const hasAdditionalInstallScript = scriptOptions.some(({ label }) =>
      (Object.values(ADDITIONAL_PACKAGE_SCRIPTS_NAMES) as string[]).includes(
        label
      )
    );

    if (hasAdditionalInstallScript) {
      return;
    }

    const scriptName = isPnpm
      ? ADDITIONAL_PACKAGE_SCRIPTS_NAMES.PNPM_INSTALL
      : isYarn
      ? ADDITIONAL_PACKAGE_SCRIPTS_NAMES.YARN_INSTALL
      : ADDITIONAL_PACKAGE_SCRIPTS_NAMES.NPM_INSTALL;

    const additionalScriptOptions: PackageScriptOption[] = [];
    additionalScriptOptions.push({
      label: scriptName,
      value: ADDITIONAL_PACKAGE_SCRIPTS[scriptName],
    });

    if (window.electron.process.platform === 'darwin') {
      additionalScriptOptions.push({
        label: ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_I_TERM,
        value:
          ADDITIONAL_PACKAGE_SCRIPTS[
            ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_I_TERM
          ],
      });
    }

    if (window.electron.process.platform === 'linux') {
      additionalScriptOptions.push({
        label:
          ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_GENOME_TERMINAL,
        value:
          ADDITIONAL_PACKAGE_SCRIPTS[
            ADDITIONAL_PACKAGE_SCRIPTS_NAMES.OPEN_CURRENT_DIR_IN_GENOME_TERMINAL
          ],
      });
    }

    additionalScriptOptions.push(
      ...ADDITIONAL_COMMON_PACKAGE_SCRIPTS.map(script => ({
        label: script.scriptName,
        value: script,
      }))
    );

    setScriptOptions([...additionalScriptOptions, ...scriptOptions]);
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
          onChange?.(scripts);
        }
      }
    })();
  }, [
    findBuildScript,
    findInstallScript,
    initialScripts,
    onChange,
    scriptOptions,
  ]);

  const handleAddScript = (): void => {
    onChange?.([...currentScripts, new PackageScript()]);
  };

  const handleRemoveScript = (indexToRemove: number): void => {
    const newScripts =
      currentScripts.filter((_script, index) => index !== indexToRemove) ?? [];
    onChange?.(newScripts.length > 0 ? newScripts : [new PackageScript()]);
  };

  const handleScriptChange = (
    modifiedScriptIndex: number,
    modifiedScript?: PackageScript
  ): void => {
    onChange?.(
      currentScripts.map((script, index) =>
        index === modifiedScriptIndex
          ? modifiedScript ?? new PackageScript()
          : script.clone()
      )
    );
  };

  const handleSortChange = (
    draggableItems: SortedDraggableItem<PackageScript>[]
  ): void => {
    onChange?.(draggableItems.map(({ dataItem }) => dataItem.clone()));
  };

  const noSelectedScriptOptions = scriptOptions.filter(({ value }) =>
    currentScripts.every(({ scriptName }) => scriptName !== value.scriptName)
  );

  return (
    <DragAndDropSorter
      onChange={handleSortChange}
      items={currentScripts.map<DraggableItem<PackageScript>>(
        (script, index) => {
          const showAddButton =
            index === currentScripts.length - 1 &&
            scriptOptions.length > currentScripts.length;
          return {
            dataItem: script,
            children: (
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
            ),
          };
        }
      )}
    />
  );
}
