import type { ScriptsType } from '@renderer/models/PackageScript';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';

export type PackageScriptOption = SelectOption<PackageScript['id']>;

export type PackageScriptsProps = {
  cwd?: string;
  selectedScripts?: PackageScript[];
  onChange: (scripts: PackageScript[]) => void;
  enablePreInstallScripts?: boolean;
  enablePostBuildScripts?: boolean;
  scriptsType?: ScriptsType;
};
