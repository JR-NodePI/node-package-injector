import DependencyPackage from '@renderer/models/DependencyPackage';
import NodePackage from '@renderer/models/NodePackage';
import PackageBunch from '@renderer/models/PackageBunch';
import PackageScript from '@renderer/models/PackageScript';

import LastSelectedScripts from './LastSelectedScripts';

export const packageBunchTemplate = new PackageBunch();
packageBunchTemplate.targetPackage = new NodePackage();
packageBunchTemplate.targetPackage.scripts = [new PackageScript()];
packageBunchTemplate.targetPackage.postBuildScripts = [new PackageScript()];
packageBunchTemplate.dependencies = [new DependencyPackage()];
packageBunchTemplate.dependencies[0].preBuildScripts = [new PackageScript()];
packageBunchTemplate.dependencies[0].scripts = [new PackageScript()];
packageBunchTemplate.dependencies[0].postBuildScripts = [new PackageScript()];

export const packageBunchesTemplate = [packageBunchTemplate];

export const packageScriptsTemplate = [new PackageScript()];

export const lastSelectedPackagesScriptsTemplate = [
  new LastSelectedScripts('template-package-name'),
];
lastSelectedPackagesScriptsTemplate[0].targetScripts = [new PackageScript()];
lastSelectedPackagesScriptsTemplate[0].targetPostBuildScripts = [
  new PackageScript(),
];
lastSelectedPackagesScriptsTemplate[0].dependencyPreBuildScripts = [
  new PackageScript(),
];
lastSelectedPackagesScriptsTemplate[0].dependencyScripts = [
  new PackageScript(),
];
