import { c } from 'fratch-ui/helpers/classNameHelpers';
import { InputCheck, Modal, ModalProps } from 'fratch-ui';
import { useRef, useState } from 'react';
import PathService from '@renderer/services/PathService';
import TerminalService from '@renderer/services/TerminalService';

export default function WSLActivator({
  cwd,
  onChange,
  className,
}: {
  cwd?: string;
  onChange: (checked: boolean) => void;
  className?: string;
}): JSX.Element {
  const isWSLAvailable = TerminalService.isWSLAvailable;

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

  if (!isWSLAvailable) {
    return <></>;
  }

  return (
    <>
      <InputCheck
        ref={ref}
        key={cwd}
        className={c(className)}
        checked={isWSLPath}
        label="WSL"
        onChange={handleWSLChange}
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
