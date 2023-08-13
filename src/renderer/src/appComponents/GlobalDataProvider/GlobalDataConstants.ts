import DependencyPackage from '@renderer/models/DependencyPackage';
import PackageBunch from '@renderer/models/PackageBunch';
import PackageScript from '@renderer/models/PackageScript';
import TargetPackage from '@renderer/models/TargetPackage';

export const packageBunchTemplateValue = new PackageBunch();
packageBunchTemplateValue.targetPackage = new TargetPackage();
packageBunchTemplateValue.targetPackage.scripts = [new PackageScript()];
packageBunchTemplateValue.dependencies = [new DependencyPackage()];
packageBunchTemplateValue.dependencies[0].scripts = [new PackageScript()];

export const packageBunchesTemplateValue = [packageBunchTemplateValue];
