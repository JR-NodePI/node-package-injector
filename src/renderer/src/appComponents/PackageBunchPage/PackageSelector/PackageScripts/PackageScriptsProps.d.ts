import type { ScriptsType } from '@renderer/models/PackageScript';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';

export type PackageScriptOption = SelectOption<PackageScript['id']>;

export type PackageScriptsProps = {
  cwd: string;
  enablePostBuildScripts?: boolean;
  enablePreInstallScripts?: boolean;
  onChange: (scripts: PackageScript[]) => void;
  scriptsType: ScriptsType;
  selectedScripts?: PackageScript[];
};
