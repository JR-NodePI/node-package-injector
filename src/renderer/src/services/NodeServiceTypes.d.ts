export type DependencyRelationProjection = {
  dependencyName: string;
  subDependenciesNames: string[];
  dependency: DependencyPackage;
};
