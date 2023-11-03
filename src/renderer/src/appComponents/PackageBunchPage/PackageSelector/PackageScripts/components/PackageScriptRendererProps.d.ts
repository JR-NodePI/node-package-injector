import PackageScript from '@renderer/models/PackageScript';
import { SelectProps } from 'fratch-ui/components';

export type PackageScriptRendererProps = {
  index: number;
  onAdd: () => void;
  onChange: (index: number, script?: PackageScript) => void;
  onRemove: (index: number) => void;
  script: PackageScript;
  scriptOptions: SelectProps.SelectOption<PackageScript>[];
  showAddButton: boolean;
};

export type PackageScriptButtonsProps = Pick<
  PackageScriptRendererProps,
  'index' | 'onAdd' | 'onRemove' | 'showAddButton'
>;
