import { DependencyMode } from '@renderer/models/DependencyConstants';
import { Form } from 'fratch-ui';

import { type DependencySelectorProps } from './DependencySelectorProps';

export default function DependencyModeSelector({
  disabled,
  dependencyConfig,
  onModeChange,
}: Pick<
  DependencySelectorProps,
  'disabled' | 'dependencyConfig' | 'onModeChange'
>): JSX.Element {
  return (
    <Form.InputCheck
      disabled={disabled}
      checked={dependencyConfig.mode === DependencyMode.SYNC}
      label="sync mode"
      onChange={(event): void => {
        onModeChange(
          dependencyConfig,
          event.target.checked ? DependencyMode.SYNC : DependencyMode.BUILD
        );
      }}
    />
  );
}
