import type PackageScript from '@renderer/models/PackageScript';

import PackageScriptButtons from './PackageScriptButtons';
import { type PackageScriptRendererProps } from './PackageScriptRendererProps';
import PackageScriptSelector from './PackageScriptSelector';

export function PackageScriptRenderer({
  index,
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

  return (
    <PackageScriptSelector
      label={`${index + 1}º p. script`}
      title={`${index + 1}º package script`}
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
