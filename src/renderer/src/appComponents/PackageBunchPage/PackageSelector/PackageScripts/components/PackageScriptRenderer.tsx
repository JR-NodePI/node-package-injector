import { formatOrdinals } from '@renderer/helpers/utilsHelpers';
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

  const ordinal = formatOrdinals(index + 1);

  return (
    <PackageScriptSelector
      label={`${ordinal}`}
      title={`${ordinal}package script`}
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
