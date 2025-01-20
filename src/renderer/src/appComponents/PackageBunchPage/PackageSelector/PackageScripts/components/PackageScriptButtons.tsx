import { Button, IconClose, IconPlus, useModal } from 'fratch-ui/components';
import { ModalCloseTypes } from 'fratch-ui/components/Modal/ModalConstants';
import type { ModalCloseType } from 'fratch-ui/components/Modal/ModalProps';
import { c } from 'fratch-ui/helpers';

import type { PackageScriptButtonsProps } from './PackageScriptRendererProps';

import styles from './PackageScriptRenderer.module.css';

export default function PackageScriptButtons({
  index,
  onAdd,
  onRemove,
  showAddButton,
  showRemoveButton,
}: PackageScriptButtonsProps): JSX.Element {
  const { showModalConfirm } = useModal();

  const handleConfirmRemove = (type: ModalCloseType): void => {
    if (type === ModalCloseTypes.ACCEPT) {
      onRemove(index);
    }
  };

  const handleRemove = (event): void => {
    event.preventDefault();
    showModalConfirm({
      title: `Are you sure to remove?`,
      content: `It will clear the script ${index + 1}.`,
      onClose: handleConfirmRemove,
    });
  };

  const handleAdd = (event): void => {
    event.preventDefault();
    onAdd();
  };

  return (
    <div className={c(styles.add_script_buttons)}>
      {showRemoveButton && (
        <Button
          onClick={handleRemove}
          Icon={IconClose}
          size="smaller"
          isRound
          label="Remove package script"
        />
      )}
      {showAddButton && (
        <Button
          type="tertiary"
          onClick={handleAdd}
          Icon={IconPlus}
          size="smaller"
          isRound
          label="Add package script"
        />
      )}
    </div>
  );
}
