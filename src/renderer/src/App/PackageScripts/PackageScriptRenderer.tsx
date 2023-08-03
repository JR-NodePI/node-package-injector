import { Button, Form } from 'fratch-ui';
import { IconClose, IconPlus } from 'fratch-ui/components/Icons/Icons';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import { type PackageScript } from '../../models/PackageScriptsTypes';
import PackageScriptSelector from './PackageScriptSelector';

import styles from './PackageScriptRenderer.module.css';

export function PackageScriptRenderer({
  index,
  onAdd,
  onChange,
  onRemove,
  script,
  scriptOptions,
  showAddButton,
}: {
  script: PackageScript;
  index: number;
  onChange: (script: PackageScript, index: number) => void;
  onRemove: (index: number) => void;
  onAdd: () => void;
  scriptOptions: Form.SelectProps.SelectOption<PackageScript>[];
  showAddButton: boolean;
}): JSX.Element {
  return (
    <PackageScriptSelector
      key={index}
      label={`${index + 1}º package script`}
      selectedScript={script}
      scriptOptions={scriptOptions}
      onChange={(script): void => {
        onChange(script, index);
      }}
      additionalComponent={
        <div className={c(styles.add_script_buttons)}>
          <Button
            onClick={(): void => onRemove(index)}
            Icon={IconClose}
            size="smaller"
            isRound
            label="Remove package script"
          />

          {showAddButton && (
            <Button
              type="secondary"
              onClick={onAdd}
              Icon={IconPlus}
              size="smaller"
              isRound
              label="Add an package script"
            />
          )}
        </div>
      }
    />
  );
}
