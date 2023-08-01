import { useEffect, useState } from 'react';

import {
  PackageInstallMode,
  type PackageInstallModeValue,
} from '@renderer/models/PackageInstallMode';
import NPMService from '@renderer/services/NPMService';
import { Form } from 'fratch-ui';

import { PackageSelectorProps } from './PackageSelectorProps';

export default function PackageInstallCheck({
  disabled,
  targetPackage,
  onInstallChange,
}: Pick<
  PackageSelectorProps,
  'disabled' | 'targetPackage' | 'onInstallChange'
>): JSX.Element {
  const [installMode, setInstallMode] = useState<PackageInstallModeValue>();

  useEffect(() => {
    (async (): Promise<void> => {
      if (targetPackage?.cwd != null) {
        const isYarn = await NPMService.checkYarn(targetPackage.cwd);
        setInstallMode(
          isYarn ? PackageInstallMode.YARN : PackageInstallMode.NPM
        );
      }
    })();
  }, [targetPackage?.cwd]);

  if (installMode == null) {
    return <></>;
  }

  const label = `${
    installMode === PackageInstallMode.YARN ? 'yarn' : 'npm'
  } install`;

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onInstallChange?.(event.target.checked ? installMode : undefined);
  };

  return (
    <Form.InputCheck
      disabled={disabled}
      checked={targetPackage?.installMode != null}
      label={label}
      onChange={handleOnChange}
    />
  );
}
