import { Form } from 'fratch-ui';

import { DependencyMode } from '@renderer/models/DependencyConstants';

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
      onChange={(checked): void => {
        onModeChange(
          dependency,
          checked ? DependencyMode.SYNC : DependencyMode.BUILD
        );
      }}
    />
  );
}
