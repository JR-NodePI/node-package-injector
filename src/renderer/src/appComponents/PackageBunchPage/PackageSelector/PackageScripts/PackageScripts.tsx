import { useEffect, useMemo, useState } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import PackageScript from '@renderer/models/PackageScript';
import NodeService from '@renderer/services/NodeService/NodeService';
import DragAndDropSorter from 'fratch-ui/components/DragAndDropSorter/DragAndDropSorter';
import {
  DraggableItem,
  SortedDraggableItem,
} from 'fratch-ui/components/DragAndDropSorter/DragAndDropSorterProps';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { PackageScriptRenderer } from './components/PackageScriptRenderer';
import type {
  PackageScriptOption,
  PackageScriptsProps,
} from './PackageScriptsProps';

const findScript = ({
  packageScripts,
  included: includeInValueTerms,
  excluded: excludeInNameTerms = [],
}: {
  packageScripts: PackageScript[];
  included: string[];
  excluded?: string[];
}): PackageScript | undefined =>
  packageScripts.find(
    ({ scriptValue, scriptName }) =>
      includeInValueTerms.some(
        term => scriptValue.includes(term) || scriptName.includes(term)
      ) &&
      !excludeInNameTerms.some(
        term => scriptValue.includes(term) || scriptName.includes(term)
      )
  );

export default function PackageScripts({
  cwd,
  enablePostBuildScripts,
  enablePreInstallScripts,
  onChange,
  scriptsType,
  selectedScripts,
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
        value: script.id,
      })),
      ...packageScripts.map(script => ({
        label: script.scriptName,
        value: script.id,
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

        const mustCalculateInstallScripts =
          scriptsType === 'preBuildScripts' ||
          (scriptsType === 'scripts' &&
            !enablePreInstallScripts &&
            enablePostBuildScripts);

        const mustCalculateDistScripts =
          scriptsType === 'postBuildScripts' ||
          (scriptsType === 'scripts' && enablePreInstallScripts);

        const mustCalculateStartScripts = mustCalculateDistScripts;

        const installScript =
          mustCalculateInstallScripts &&
          findScript({
            packageScripts,
            included: ['install'],
            excluded: ['prepare'],
          });

        const buildScript =
          mustCalculateDistScripts &&
          findScript({
            packageScripts,
            included: ['pack'],
            excluded: ['clean'],
          });

        const startScript =
          mustCalculateStartScripts &&
          findScript({
            packageScripts,
            included: ['start', 'dev'],
            excluded: ['install', 'pack', 'test'],
          });

        if (installScript) {
          scripts.push(installScript);
        }

        if (buildScript) {
          scripts.push(buildScript);
        }

        if (startScript) {
          scripts.push(startScript);
        }

        if (scripts.length === 0) {
          scripts.push(new PackageScript());
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
    enablePostBuildScripts,
    enablePreInstallScripts,
    onChange,
    packageScripts,
    scriptsType,
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
    modifiedScriptId?: PackageScript['id']
  ): void => {
    const selectedScript = [
      ...filteredAdditionalPackageScripts,
      ...packageScripts,
    ].find(script => script.id === modifiedScriptId);

    onChange(
      (selectedScripts ?? []).map((script, index) =>
        index === modifiedScriptIndex
          ? selectedScript
            ? selectedScript.clone()
            : new PackageScript()
          : script.clone()
      )
    );
  };

  const handleDisabledChange = (
    scriptId: PackageScript['id'],
    disabled: boolean
  ): void => {
    onChange(
      (selectedScripts ?? []).map(script => {
        if (script.id === scriptId) {
          const newScript = script.clone();
          newScript.disabled = disabled;
          return newScript;
        }

        return script;
      })
    );
  };

  const handleSortChange = (
    draggableItems: SortedDraggableItem<PackageScript>[]
  ): void => {
    onChange(draggableItems.map(({ dataItem }) => dataItem.clone()));
  };

  const scriptOptionsHiddenUsed = useMemo(
    () =>
      scriptOptions.map(option => ({
        ...option,
        visible: !(selectedScripts ?? []).some(({ id }) => id === option.value),
      })),
    [scriptOptions, selectedScripts]
  );

  const isDraggable = (selectedScripts?.length ?? 0) > 1;

  return (
    <DragAndDropSorter
      onChange={handleSortChange}
      draggable={isDraggable}
      items={(selectedScripts ?? []).map<DraggableItem<PackageScript>>(
        (script, index) => {
          const showRemoveButton = (selectedScripts ?? []).length > 1;
          const showAddButton =
            index === (selectedScripts ?? []).length - 1 &&
            scriptOptions.length > (selectedScripts ?? []).length;

          return {
            dataItem: script,
            children: (
              <PackageScriptRenderer
                index={index}
                isDraggable={isDraggable}
                key={`${script.id}-${script.scriptName}`}
                onAdd={handleAddScript}
                onChange={handleScriptChange}
                onDisabledChange={handleDisabledChange}
                onRemove={handleRemoveScript}
                script={script}
                scriptOptions={scriptOptionsHiddenUsed}
                showAddButton={showAddButton}
                showRemoveButton={showRemoveButton}
              />
            ),
          };
        }
      )}
    />
  );
}
