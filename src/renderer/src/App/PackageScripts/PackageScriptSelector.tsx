import { type PackageScript } from '@renderer/models/PackageScriptsTypes';
import { Form } from 'fratch-ui';
import { SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './PackageScriptSelector.module.css';

type PackageScriptSelector = {
  label: string;
  selectedScript: PackageScript;
  scriptOptions: SelectOption<PackageScript>[];
  onChange: (script: PackageScript) => void;
  additionalComponent?: JSX.Element;
};

export default function PackageScriptSelector({
  label,
  selectedScript,
  scriptOptions,
  onChange,
  additionalComponent,
}: PackageScriptSelector): JSX.Element {
  const handleOnChange = (selectedScript?: PackageScript): void => {
    onChange(selectedScript ?? { scriptName: '', scriptValue: '' });
  };
  let finalOptions = [...scriptOptions];
  const mustAddSelected = scriptOptions.every(
    option => option.value.scriptName !== selectedScript.scriptName
  );
  if (mustAddSelected) {
    finalOptions = [
      { value: selectedScript, label: selectedScript.scriptName },
      ...finalOptions,
    ];
  }
  finalOptions = finalOptions.filter(
    option => !!option.value.scriptName.trim()
  );
  finalOptions.sort((a, b) => a.label.localeCompare(b.label));

  const selectorPlaceholder = 'Select script...';
  return (
    <div className={c(styles.mode_scripts)}>
      <Form.LeftLabeledField
        label={<>{label}</>}
        field={
          <Form.Select
            value={selectedScript}
            options={finalOptions}
            placeholder={selectorPlaceholder}
            onChange={handleOnChange}
            cleanable
          />
        }
      />
      <p
        title={selectedScript?.scriptValue}
        className={c(
          styles.scripts_value,
          selectedScript?.scriptValue ? styles.scripts_value_filled : ''
        )}
      >
        {selectedScript?.scriptValue && (
          <span>{selectedScript?.scriptValue}</span>
        )}
      </p>
      {additionalComponent}
    </div>
  );
}
