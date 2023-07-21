import { useRef, useState } from 'react';

import PathService from '@renderer/services/PathService';
import { InputCheck, Modal, ModalProps } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';
export default function WSLActivator({
  cwd,
  onChange,
  className,
}: {
  cwd?: string;
  onChange: (checked: boolean) => void;
  className?: string;
}): JSX.Element {
  const isWSLPath = PathService.isWSL(cwd);

  const ref = useRef<HTMLInputElement>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleWSLChange = (): void => {
    setConfirmVisible(true);
  };

  const handleConfirmClose = (type: ModalProps.ModalCloseType): void => {
    setConfirmVisible(false);

    if (ref.current?.checked == null) {
      return;
    }

    if (type === 'accept') {
      onChange(ref.current.checked);
    } else {
      ref.current.checked = !ref.current.checked;
    }
  };

  return (
    <>
      <InputCheck
        ref={ref}
        key={cwd}
        className={c(className)}
        checked={isWSLPath}
        label="activate WSL"
        onChange={handleWSLChange}
        position="right"
      />
      <Modal
        visible={confirmVisible}
        type="confirm"
        onClose={handleConfirmClose}
        title={`Are you sure to change to ${isWSLPath ? 'windows' : 'WSL'}?`}
      >
        It will clear all dependencies and configurations.
      </Modal>
    </>
  );
}
