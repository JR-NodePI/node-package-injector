import { Button } from 'fratch-ui';
import { IconClose, IconPlus } from 'fratch-ui/components/Icons/Icons';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import type { PackageScriptButtonsProps } from './PackageScriptRendererProps';

import styles from './PackageScriptRenderer.module.css';

export default function PackageScriptButtons({
  index,
  onAdd,
  onRemove,
  showAddButton,
}: PackageScriptButtonsProps): JSX.Element {
  return (
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
          type="tertiary"
          onClick={onAdd}
          Icon={IconPlus}
          size="smaller"
          isRound
          label="Add an package script"
        />
      )}
    </div>
  );
}
