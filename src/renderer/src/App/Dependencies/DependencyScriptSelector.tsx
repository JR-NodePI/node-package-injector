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

export default function DependencyScriptSelector({
  dependency,
  onScriptChange,
}: DependencyScriptSelectorProps): JSX.Element {
  const selectorPlaceholder = 'Select script...';
  const [script, setScript] = useState<string>(dependency.script ?? '');
  const [scriptOptions, setScriptOptions] = useState<
    Form.SelectProps.SelectOption<string>[]
  >([]);

  useEffect(() => {
    (async (): Promise<void> => {
      const scripts = await NPMService.getPackageScripts(dependency?.cwd ?? '');
      const scriptOptions = Object.entries(scripts).map(([key, value]) => ({
        value,
        label: key,
      }));
      setScriptOptions(scriptOptions);
    })();
  }, []);

  const handleOnChange = (value?: string): void => {
    onScriptChange?.(dependency, value);
    setScript(value ?? '');
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
          {script && (
            <p title={script} className={c(styles.scripts_value)}>
              <span>{script}</span>
            </p>
          )}
        </>
      )}
    </div>
  );
}
