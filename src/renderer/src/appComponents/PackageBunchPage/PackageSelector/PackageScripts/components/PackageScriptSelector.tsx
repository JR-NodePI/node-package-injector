import { useMemo } from 'react';

import type PackageScript from '@renderer/models/PackageScript';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import { PackageScriptOption } from '../PackageScriptsProps';

import styles from './PackageScriptSelector.module.css';

type PackageScriptSelector = {
  additionalComponent?: JSX.Element;
  label: JSX.Element;
  onChange: (scriptId?: PackageScript['id']) => void;
  scriptOptions: PackageScriptOption[];
  selectedScript: PackageScript;
};

export default function PackageScriptSelector({
  additionalComponent,
  label,
  onChange,
  scriptOptions,
  selectedScript,
}: PackageScriptSelector): JSX.Element {
  const handleOnChange = (scriptId?: PackageScript['id']): void => {
    onChange(scriptId);
  };

  const options = useMemo(
    () =>
      scriptOptions.map(option => {
        if (option.value === selectedScript?.id) {
          return { ...option, visible: true };
        }
        return option;
      }),
    [scriptOptions, selectedScript?.id]
  );

  const selectorPlaceholder = 'Select script...';

  return (
    <div className={c(styles.mode_scripts)}>
      <LeftLabeledField
        label={label}
        field={
          <Select<PackageScriptOption['value']>
            value={selectedScript.id}
            options={options}
            placeholder={selectorPlaceholder}
            onChange={handleOnChange}
            cleanable
            searchable
            disabled={selectedScript?.disabled}
          />
        }
      />
      <div
        title={selectedScript?.scriptValue}
        className={c(
          styles.scripts_value,
          selectedScript?.scriptValue ? styles.scripts_value_filled : ''
        )}
      >
        {selectedScript?.scriptName && (
          <p>
            <span>{selectedScript?.scriptName}: </span>
            <span>{selectedScript?.scriptValue}</span>
          </p>
        )}
      </div>
      {additionalComponent}
    </div>
  );
}
