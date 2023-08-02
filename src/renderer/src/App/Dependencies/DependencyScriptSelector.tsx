import { useEffect, useState } from 'react';

import { DependencyMode } from '@renderer/models/DependencyConstants';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import { type DependencySelectorProps } from './DependencySelectorProps';

import styles from './DependencyScriptSelector.module.css';

type DependencyScriptSelectorProps = Pick<
  DependencySelectorProps,
  'dependency' | 'onScriptChange'
>;

type ScriptSelectOption = {
  scriptName: string;
  scriptValue: string;
};

export default function DependencyScriptSelector({
  dependency,
  onScriptChange,
}: DependencyScriptSelectorProps): JSX.Element {
  const selectorPlaceholder = 'Select script...';
  const [script, setScript] = useState<ScriptSelectOption>();
  const [scriptOptions, setScriptOptions] = useState<
    Form.SelectProps.SelectOption<ScriptSelectOption>[]
  >([]);

  // load package scripts
  useEffect(() => {
    (async (): Promise<void> => {
      const scripts = await NPMService.getPackageScripts(dependency?.cwd ?? '');
      const scriptOptions = Object.entries(scripts).map(
        ([scriptName, scriptValue]) => ({
          value: { scriptName, scriptValue },
          label: scriptName,
        })
      );
      setScriptOptions(scriptOptions);
    })();
  }, []);

  // determine the selected script
  useEffect(() => {
    const initialSelectedScript = scriptOptions.find(
      option =>
        option.value.scriptName === dependency.script ||
        /\s(pack)\s/gi.test(option.value.scriptValue) ||
        /\s(pack)$/gi.test(option.value.scriptValue)
    );

    const hasSelectedScript = initialSelectedScript?.value != null;

    if (hasSelectedScript) {
      setScript(initialSelectedScript.value);
    }

    const mustSetDependencyScript =
      hasSelectedScript &&
      initialSelectedScript.value.scriptName !== dependency.script;

    if (mustSetDependencyScript) {
      onScriptChange?.(dependency, initialSelectedScript.value.scriptName);
    }
  }, [scriptOptions, dependency]);

  const handleOnChange = (selectedScript?: ScriptSelectOption): void => {
    onScriptChange?.(dependency, selectedScript?.scriptName);
    setScript(selectedScript);
  };

  return (
    <div className={c(styles.mode_scripts)}>
      {dependency.mode === DependencyMode.BUILD && (
        <>
          <Form.LeftLabeledField
            label={<>Package script</>}
            field={
              <Form.Select
                value={script}
                options={scriptOptions}
                placeholder={selectorPlaceholder}
                onChange={handleOnChange}
                cleanable
              />
            }
          />
          {script?.scriptValue && (
            <p title={script?.scriptValue} className={c(styles.scripts_value)}>
              <span>{script?.scriptValue}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
