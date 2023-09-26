import { useRef, useState } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import { Form, Modal } from 'fratch-ui';
import { type ModalCloseType } from 'fratch-ui/components/Modal/ModalProps';
import { c } from 'fratch-ui/helpers/classNameHelpers';

export default function WSLActivator({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { setPackageBunches, isWSLActive, setIsWSLActive, loading } =
    useGlobalData();

  const ref = useRef<HTMLInputElement>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleWSLActiveChange = (setWSL: boolean): void => {
    setIsWSLActive?.(setWSL);
    setPackageBunches?.([]);
  };

  const handleWSLChange = (): void => {
    setConfirmVisible(true);
  };

  const handleConfirmClose = (type: ModalCloseType): void => {
    setConfirmVisible(false);

    if (ref.current?.checked == null) {
      return;
    }

    if (type === 'accept') {
      handleWSLActiveChange(ref.current.checked);
    } else {
      ref.current.checked = !ref.current.checked;
    }
  };

  if (loading) {
    return <></>;
  }

  return (
    <>
      <Form.InputCheck
        ref={ref}
        className={c(className)}
        checked={isWSLActive}
        label="activate ⚡WSL"
        onChange={handleWSLChange}
        position="right"
      />
      <Modal
        visible={confirmVisible}
        type="confirm"
        onClose={handleConfirmClose}
        title={`Are you sure to change to ${isWSLActive ? 'windows' : 'WSL'}?`}
      >
        It will clear all dependencies and configurations.
      </Modal>
    </>
  );
}
