import { type PackageScript } from '@renderer/models/PackageScriptsTypes';
import { Form } from 'fratch-ui';
import { SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './PackageScriptSelector.module.css';

export default function PackageScriptSelector({
  label,
  selectedScript,
  scriptOptions,
  onChange,
  additionalComponent,
}: {
  label: string;
  selectedScript: PackageScript;
  scriptOptions: SelectOption<PackageScript>[];
  onChange: (script: PackageScript) => void;
  additionalComponent?: JSX.Element;
}): JSX.Element {
  const handleOnChange = (selectedScript?: PackageScript): void => {
    onChange(selectedScript ?? { scriptName: '', scriptValue: '' });
  };

  const selectorPlaceholder = 'Select script...';
  return (
    <div className={c(styles.mode_scripts)}>
      <Form.LeftLabeledField
        label={<>{label}</>}
        field={
          <Form.Select
            value={selectedScript}
            options={scriptOptions}
            placeholder={selectorPlaceholder}
            onChange={handleOnChange}
            cleanable
          />
        }
      />
      {selectedScript?.scriptValue && (
        <p
          title={selectedScript?.scriptValue}
          className={c(styles.scripts_value)}
        >
          <span>{selectedScript?.scriptValue}</span>
        </p>
      )}
      {additionalComponent}
    </div>
  );
}
