import DependencyPackage from '@renderer/models/DependencyPackage';

export type RelatedDependencyProjection = {
  subDependenciesNames: string[];
  subDependencies: DependencyPackage[];
  dependency: DependencyPackage;
};
