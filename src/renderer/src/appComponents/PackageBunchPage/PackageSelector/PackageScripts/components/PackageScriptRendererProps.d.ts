import PackageScript from '@renderer/models/PackageScript';
import { SelectProps } from 'fratch-ui/components';

export type PackageScriptRendererProps = {
  index: number;
  isDraggable?: boolean;
  onAdd: () => void;
  onChange: (index: number, scriptId?: PackageScript['id']) => void;
  onDisabledChange?: (scriptId: PackageScript['id'], enabled: boolean) => void;
  onRemove: (index: number) => void;
  script: PackageScript;
  scriptOptions: SelectProps.SelectOption<PackageScript>[];
  showAddButton: boolean;
  showRemoveButton: boolean;
};

export type PackageScriptButtonsProps = Pick<
  PackageScriptRendererProps,
  'index' | 'onAdd' | 'onRemove' | 'showAddButton' | 'showRemoveButton'
> & {
  requireRemoveConfirmation?: boolean;
};
