import { Button, IconClose, IconPlus } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

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
        onClick={(event): void => {
          event.preventDefault();
          onRemove(index);
        }}
        Icon={IconClose}
        size="smaller"
        isRound
        label="Remove package script"
      />
      {showAddButton && (
        <Button
          type="tertiary"
          onClick={(event): void => {
            event.preventDefault();
            onAdd();
          }}
          Icon={IconPlus}
          size="smaller"
          isRound
          label="Add an package script"
        />
      )}
    </div>
  );
}
