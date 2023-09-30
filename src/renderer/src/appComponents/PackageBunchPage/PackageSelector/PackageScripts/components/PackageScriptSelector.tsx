import { useMemo, useState } from 'react';

import type PackageScript from '@renderer/models/PackageScript';
import { Form } from 'fratch-ui';
import { SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './PackageScriptSelector.module.css';

type PackageScriptSelector = {
  label: string;
  title: string;
  selectedScript: PackageScript;
  scriptOptions: SelectOption<PackageScript>[];
  onChange: (script?: PackageScript) => void;
  additionalComponent?: JSX.Element;
};

export default function PackageScriptSelector({
  label,
  title,
  selectedScript,
  scriptOptions,
  onChange,
  additionalComponent,
}: PackageScriptSelector): JSX.Element {
  const [id] = useState<string>(crypto.randomUUID());

  const handleOnChange = (selectedScript?: PackageScript): void => {
    onChange(selectedScript);
  };

  const selectorPlaceholder = 'Select script...';
  return (
    <div className={c(styles.mode_scripts)}>
      <Form.LeftLabeledField
        label={
          <label htmlFor={id} title={title}>
            {label}
          </label>
        }
        field={
          <Form.Select
            id={id}
            value={selectedScript}
            options={scriptOptions}
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
