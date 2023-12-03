import { formatOrdinals } from '@renderer/helpers/utilsHelpers';
import type PackageScript from '@renderer/models/PackageScript';
import { IconSortVertical } from 'fratch-ui';

import PackageScriptButtons from './PackageScriptButtons';
import { type PackageScriptRendererProps } from './PackageScriptRendererProps';
import PackageScriptSelector from './PackageScriptSelector';

import styles from './PackageScriptRenderer.module.css';

export function PackageScriptRenderer({
  index,
  isDraggable,
  onAdd,
  onChange,
  onRemove,
  script,
  scriptOptions,
  showAddButton,
}: PackageScriptRendererProps): JSX.Element {
  const handleOnChange = (script?: PackageScript): void => {
    onChange(index, script);
  };

  const ordinal = formatOrdinals(index + 1);

  return (
    <PackageScriptSelector
      label={
        <span
          title={`${ordinal}package script`}
          className={styles.mode_scripts_label}
        >
          {isDraggable && (
            <>
              <IconSortVertical /> &nbsp;
            </>
          )}
          {ordinal}
        </span>
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
        />
      }
    />
  );
}
