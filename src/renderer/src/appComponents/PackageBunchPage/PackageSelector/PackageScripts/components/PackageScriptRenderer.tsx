import { formatOrdinals } from '@renderer/helpers/utilsHelpers';
import type PackageScript from '@renderer/models/PackageScript';
import { IconSortVertical, InputCheck } from 'fratch-ui';

import PackageScriptButtons from './PackageScriptButtons';
import { type PackageScriptRendererProps } from './PackageScriptRendererProps';
import PackageScriptSelector from './PackageScriptSelector';

import styles from './PackageScriptRenderer.module.css';

function PackageScriptLabel({
  index,
  isDraggable,
  onDisabledChange,
  script,
}: Pick<
  PackageScriptRendererProps,
  'index' | 'isDraggable' | 'onDisabledChange' | 'script'
>): JSX.Element {
  const ordinal = formatOrdinals(index + 1);

  const handleDisableOnChange = (checked: boolean): void => {
    onDisabledChange?.(script.id, !checked);
  };

  const isDisablingAvailable = !script.scriptName;
  const isEnabled = !isDisablingAvailable && !script.disabled;

  return (
    <div className={styles.mode_scripts_label}>
      {isDraggable && <IconSortVertical />}
      <span>{ordinal}</span>
      <div
        title={
          isDisablingAvailable
            ? ''
            : script.disabled
            ? `Disabled on the building process`
            : `Enabled on the building process`
        }
      >
        <InputCheck
          disabled={isDisablingAvailable}
          checked={isEnabled}
          label="-"
          onChange={handleDisableOnChange}
          position="right"
        />
      </div>
    </div>
  );
}

export function PackageScriptRenderer({
  index,
  isDraggable,
  onAdd,
  onChange,
  onDisabledChange,
  onRemove,
  script,
  scriptOptions,
  showAddButton,
  showRemoveButton,
}: PackageScriptRendererProps): JSX.Element {
  const handleOnChange = (scriptId?: PackageScript['id']): void => {
    onChange(index, scriptId);
  };

  return (
    <PackageScriptSelector
      label={
        <PackageScriptLabel
          index={index}
          isDraggable={isDraggable}
          onDisabledChange={onDisabledChange}
          script={script}
        />
      }
      selectedScript={script}
      scriptOptions={scriptOptions}
      onChange={handleOnChange}
      additionalComponent={
        <PackageScriptButtons
          index={index}
          onAdd={onAdd}
          onRemove={onRemove}
          showAddButton={showAddButton}
          showRemoveButton={showRemoveButton}
        />
      }
    />
  );
}
