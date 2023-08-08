import { DependencyMode } from '@renderer/models/DependencyConstants';
import { Form } from 'fratch-ui';

import { DependencySelectorProps } from './DependencySelectorProps';

type DependencyModeCheckProps = Pick<
  DependencySelectorProps,
  'disabled' | 'dependency' | 'onModeChange'
>;

export default function DependencyModeCheck({
  disabled,
  dependency,
  onModeChange,
}: DependencyModeCheckProps): JSX.Element {
  return (
    <Form.InputCheck
      disabled={disabled}
      checked={dependency.mode === DependencyMode.SYNC}
      label="sync mode"
      onChange={(event): void => {
        onModeChange(
          dependency,
          event.target.checked ? DependencyMode.SYNC : DependencyMode.BUILD
        );
      }}
    />
  );
}
