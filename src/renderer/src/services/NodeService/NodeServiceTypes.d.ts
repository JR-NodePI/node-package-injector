import DependencyPackage from '@renderer/models/DependencyPackage';

export type RelatedDependencyProjection = {
  dependencyName: string;
  subDependenciesNames: string[];
  subDependencies: DependencyPackage[];
  dependency: DependencyPackage;
};
