import PackageScript from '@renderer/models/PackageScript';
import { Form } from 'fratch-ui';

export type PackageScriptRendererProps = {
  index: number;
  onAdd: () => void;
  onChange: (index: number, script?: PackageScript) => void;
  onRemove: (index: number) => void;
  script: PackageScript;
  scriptOptions: Form.SelectProps.SelectOption<PackageScript>[];
  showAddButton: boolean;
};

export type PackageScriptButtonsProps = Pick<
  PackageScriptRendererProps,
  'index' | 'onAdd' | 'onRemove' | 'showAddButton'
>;
