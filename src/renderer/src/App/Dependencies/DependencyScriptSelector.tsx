import { useEffect, useState } from 'react';

import { DependencyMode } from '@renderer/models/DependencyConstants';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import { DependencyModeSelectorProps } from './DependencySelectorProps';

import styles from './DependencyScriptSelector.module.css';

export default function DependencyScriptSelector({
  dependency,
}: DependencyModeSelectorProps): JSX.Element {
  const [options, setScripts] = useState<
    Form.SelectProps.SelectOption<string>[]
  >([]);

  useEffect(() => {
    (async (): Promise<void> => {
      const scripts = await NPMService.getPackageScripts(dependency?.cwd ?? '');
      setScripts(
        Object.entries(scripts).map(([key, value]) => ({
          value,
          label: key,
        }))
      );
    })();
  }, []);

  const [script, setScript] = useState<string>();
  const handleOnChange = (value?: string): void => {
    setScript(value);
  };

  return (
    <div className={c(styles.mode_scripts)}>
      {dependency.mode === DependencyMode.BUILD && (
        <>
          <Form.LeftLabeledField
            label={<>Package script</>}
            field={
              <Form.Select
                options={options}
                placeholder="Select script..."
                onChange={handleOnChange}
              />
            }
          />
          {script && (
            <p title={script} className={c(styles.scripts_value)}>
              {script}
            </p>
          )}
        </>
      )}
    </div>
  );
}
