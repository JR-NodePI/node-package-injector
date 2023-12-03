import { useMemo } from 'react';

import type PackageScript from '@renderer/models/PackageScript';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import { SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import { c } from 'fratch-ui/helpers';

import styles from './PackageScriptSelector.module.css';

type PackageScriptSelector = {
  additionalComponent?: JSX.Element;
  label: JSX.Element;
  onChange: (script?: PackageScript) => void;
  scriptOptions: SelectOption<PackageScript>[];
  selectedScript: PackageScript;
};

export default function PackageScriptSelector({
  additionalComponent,
  label,
  onChange,
  scriptOptions,
  selectedScript,
}: PackageScriptSelector): JSX.Element {
  const handleOnChange = (selectedScript?: PackageScript): void => {
    onChange(selectedScript);
  };

  const options = useMemo(
    () =>
      scriptOptions.map(option => {
        if (option.value.id === selectedScript?.id) {
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
          <Select
            value={selectedScript}
            options={options}
            placeholder={selectorPlaceholder}
            onChange={handleOnChange}
            cleanable
            searchable
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
