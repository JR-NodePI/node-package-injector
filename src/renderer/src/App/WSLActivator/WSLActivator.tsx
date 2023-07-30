import { useRef, useState } from 'react';

import PackageConfig from '@renderer/models/PackageConfig';
import PackageConfigBunch from '@renderer/models/PackageConfigBunch';
import PathService from '@renderer/services/PathService';
import PersistService from '@renderer/services/PersistService';
import { getTabTitle } from '@renderer/utils';
import { Form, Modal, ModalProps } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import getRandomColor from 'fratch-ui/helpers/getRandomColor';

import useGlobalData from '../GlobalDataProvider/hooks/useGlobalData';

export default function WSLActivator({
  className,
}: {
  className?: string;
}): JSX.Element {
  const { setPackageConfigBunches, isWSLActive, setIsWSLActive } =
    useGlobalData();

  const ref = useRef<HTMLInputElement>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const handleWSLActiveChange = (setWSL: boolean): void => {
    (async (): Promise<void> => {
      setIsWSLActive?.(setWSL);

      await PersistService.clear();

      const bunch = new PackageConfigBunch();
      bunch.packageConfig = new PackageConfig();
      bunch.packageConfig.cwd = await PathService.getHomePath(setWSL);
      bunch.active = true;
      bunch.name = getTabTitle(1);
      bunch.color = getRandomColor();

      setPackageConfigBunches?.([bunch]);
    })();
  };

  const handleWSLChange = (): void => {
    setConfirmVisible(true);
  };

  const handleConfirmClose = (type: ModalProps.ModalCloseType): void => {
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

  return (
    <>
      <Form.InputCheck
        ref={ref}
        className={c(className)}
        checked={isWSLActive}
        label="activate WSL"
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
