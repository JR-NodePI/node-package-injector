import { useRef } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import { InputCheck, useModal } from 'fratch-ui/components';
import { type ModalCloseType } from 'fratch-ui/components/Modal/ModalProps';
import { c } from 'fratch-ui/helpers';

export default function WSLActivator({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { showModalConfirm } = useModal();
  const { setPackageBunches, isWSLActive, setIsWSLActive, loading } =
    useGlobalData();

  const ref = useRef<HTMLInputElement>(null);

  const handleWSLActiveChange = (setWSL: boolean): void => {
    setIsWSLActive?.(setWSL);
    setPackageBunches?.([]);
  };

  const handleConfirmClose = (type: ModalCloseType): void => {
    if (ref.current?.checked == null) {
      return;
    }

    if (type === 'accept') {
      handleWSLActiveChange(ref.current.checked);
    } else {
      ref.current.checked = !ref.current.checked;
    }
  };

  const handleWSLChange = (): void => {
    showModalConfirm({
      title: `Are you sure to change to ${isWSLActive ? 'windows' : 'WSL'}?`,
      content: `It will clear all dependencies and configurations.`,
      onClose: handleConfirmClose,
    });
  };

  if (loading) {
    return <></>;
  }

  return (
    <InputCheck
      ref={ref}
      className={c(className)}
      checked={isWSLActive}
      label="activate ⚡WSL"
      onChange={handleWSLChange}
      position="right"
    />
  );
}
