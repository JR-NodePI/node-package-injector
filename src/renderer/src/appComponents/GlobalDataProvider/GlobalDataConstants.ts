import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';
import PackageScript from '@renderer/models/PackageScript';

export const packageBunchTemplateValue = new PackageBunch();
packageBunchTemplateValue.targetPackage = new NodePackage();
packageBunchTemplateValue.targetPackage.scripts = [new PackageScript()];
packageBunchTemplateValue.targetPackage.afterBuildScripts = [
  new PackageScript(),
];
packageBunchTemplateValue.dependencies = [new DependencyPackage()];
packageBunchTemplateValue.dependencies[0].scripts = [new PackageScript()];
packageBunchTemplateValue.dependencies[0].afterBuildScripts = [
  new PackageScript(),
];

export const packageBunchesTemplateValue = [packageBunchTemplateValue];

export const additionalPackageScriptsTemplateValue = [new PackageScript()];
