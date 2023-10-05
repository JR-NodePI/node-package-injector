import { useEffect, useMemo, useState } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import PackageScript from '@renderer/models/PackageScript';
import NodeService from '@renderer/services/NodeService/NodeService';
import DragAndDropSorter from 'fratch-ui/components/DragAndDropSorter/DragAndDropSorter';
import {
  DraggableItem,
  SortedDraggableItem,
} from 'fratch-ui/components/DragAndDropSorter/DragAndDropSorterProps';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { PackageScriptRenderer } from './components/PackageScriptRenderer';

type PackageScriptOption = SelectOption<PackageScript>;
type PackageScriptsProps = {
  cwd?: string;
  selectedScripts?: PackageScript[];
  onChange: (scripts: PackageScript[]) => void;
  findInstallScript?: boolean;
  findBuildScript?: boolean;
};

export default function PackageScripts({
  cwd = '',
  selectedScripts,
  onChange,
  findInstallScript,
  findBuildScript,
}: PackageScriptsProps): JSX.Element {
  const { additionalPackageScripts } = useGlobalData();
  const filteredAdditionalPackageScripts = additionalPackageScripts.filter(
    script => script.scriptName !== '' && script.scriptValue !== ''
  );

  const [packageScripts, setPackageScripts] = useState<PackageScript[]>([]);
  const [scriptOptions, setScriptOptions] = useState<PackageScriptOption[]>([]);

  // load package.json scripts
  const [initialScripts] = useState<PackageScript[]>(selectedScripts ?? []);
  useEffect(() => {
    const abortController = new AbortController();

    (async (): Promise<void> => {
      const rawScripts = await NodeService.getPackageScripts(cwd ?? '');
      const scripts = Object.entries(rawScripts).map(
        ([scriptName, scriptValue]) =>
          initialScripts.find(script => script.scriptName === scriptName) ??
          new PackageScript(scriptName, scriptValue)
      );

      if (abortController.signal.aborted) {
        return;
      }

      setPackageScripts(scripts);
    })();

    return () => {
      abortController.abort();
    };
  }, [cwd, initialScripts]);

  // create select options from package scripts and additional scripts
  useDeepCompareEffect(() => {
    if (!packageScripts?.length) {
      return;
    }

    const options: PackageScriptOption[] = [
      ...filteredAdditionalPackageScripts.map(script => ({
        label: `🤖 ${script.scriptName}`,
        value: script,
      })),
      ...packageScripts.map(script => ({
        label: script.scriptName,
        value: script,
      })),
    ];

    setScriptOptions(options);
  }, [packageScripts, filteredAdditionalPackageScripts]);

  // update selected scripts when additional scripts change
  useDeepCompareEffect(() => {
    if (!selectedScripts?.length || !filteredAdditionalPackageScripts?.length) {
      return;
    }

    const additionalScriptComparer =
      (scriptA: PackageScript) =>
      (scriptB: PackageScript): boolean =>
        scriptA.id === scriptB.id &&
        (scriptA.scriptName !== scriptB.scriptName ||
          scriptA.scriptValue !== scriptB.scriptValue);

    const hasAdditionalScriptsWithChanges = selectedScripts.some(script =>
      filteredAdditionalPackageScripts.some(additionalScriptComparer(script))
    );

    if (!hasAdditionalScriptsWithChanges) {
      return;
    }

    const newScripts = selectedScripts.map(script => {
      const additionalScript = filteredAdditionalPackageScripts.find(
        additionalScriptComparer(script)
      );
      return additionalScript ? additionalScript : script;
    });

    onChange(newScripts);
  }, [selectedScripts, filteredAdditionalPackageScripts, onChange]);

  // remove selected scripts when available scripts was removed
  useDeepCompareEffect(() => {
    if (
      !selectedScripts?.length ||
      !packageScripts?.length ||
      !additionalPackageScripts?.length
    ) {
      return;
    }

    const isAvailableScript = (selectedScript: PackageScript): boolean =>
      [...packageScripts, ...additionalPackageScripts].some(
        ({ id, scriptName, scriptValue }) =>
          selectedScript.id === id && scriptName !== '' && scriptValue !== ''
      );

    const hasScriptsToRemove = selectedScripts.some(
      script =>
        script.scriptName !== '' &&
        script.scriptValue !== '' &&
        !isAvailableScript(script)
    );

    if (!hasScriptsToRemove) {
      return;
    }

    const filteredScripts = selectedScripts.filter(script =>
      isAvailableScript(script)
    );

    if (filteredScripts.length === 0) {
      filteredScripts.push(new PackageScript());
    }

    onChange(filteredScripts);
  }, [selectedScripts, packageScripts, additionalPackageScripts, onChange]);

  // try to determine the install and pack script
  useDeepCompareEffect(() => {
    const abortController = new AbortController();

    (async (): Promise<void> => {
      if (selectedScripts == null && packageScripts.length > 0) {
        const scripts: PackageScript[] = [];

        const installScript =
          findInstallScript &&
          packageScripts.find(
            ({ scriptValue, scriptName }) =>
              / install/gi.test(scriptValue) && !/prepare/gi.test(scriptName)
          );

        if (installScript) {
          scripts.push(installScript);
        } else {
          scripts.push(new PackageScript());
        }

        const buildScript =
          findBuildScript &&
          packageScripts.find(
            ({ scriptValue }) =>
              / pack /gi.test(scriptValue) || / pack$/gi.test(scriptValue)
          );

        if (buildScript) {
          scripts.push(buildScript);
        }

        if (abortController.signal.aborted) {
          return;
        }

        onChange(scripts);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [
    findBuildScript,
    findInstallScript,
    onChange,
    packageScripts,
    selectedScripts,
  ]);

  const handleAddScript = (): void => {
    onChange([...(selectedScripts ?? []), new PackageScript()]);
  };

  const handleRemoveScript = (indexToRemove: number): void => {
    const newScripts =
      (selectedScripts ?? []).filter(
        (_script, index) => index !== indexToRemove
      ) ?? [];
    onChange(newScripts.length > 0 ? newScripts : [new PackageScript()]);
  };

  const handleScriptChange = (
    modifiedScriptIndex: number,
    modifiedScript?: PackageScript
  ): void => {
    onChange(
      (selectedScripts ?? []).map((script, index) =>
        index === modifiedScriptIndex
          ? modifiedScript ?? new PackageScript()
          : script.clone()
      )
    );
  };

  const handleSortChange = (
    draggableItems: SortedDraggableItem<PackageScript>[]
  ): void => {
    onChange(draggableItems.map(({ dataItem }) => dataItem.clone()));
  };

  const scriptOptionsHiddenUsed = useMemo(
    () =>
      scriptOptions.map(option => {
        const visible = !(selectedScripts ?? []).some(
          ({ id, scriptName }) =>
            id === option.value.id || scriptName === option.value.scriptName
        );
        return { ...option, visible };
      }),
    [scriptOptions, selectedScripts]
  );

  return (
    <DragAndDropSorter
      onChange={handleSortChange}
      items={(selectedScripts ?? []).map<DraggableItem<PackageScript>>(
        (script, index) => {
          const showAddButton =
            index === (selectedScripts ?? []).length - 1 &&
            scriptOptions.length > (selectedScripts ?? []).length;

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
                scriptOptions={scriptOptionsHiddenUsed}
                showAddButton={showAddButton}
              />
            ),
          };
        }
      )}
    />
  );
}
