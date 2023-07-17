import PackageConfig from './PackageConfig';

export const DependencyMode = {
  BUILD: 'build' as const,
  SYNC: 'sync' as const,
};

export default class DependencyConfig extends PackageConfig {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;

  public relatedDependencyConfigIds?: string[];

  public clone(): DependencyConfig {
    const clone: DependencyConfig = Object.assign(
      new DependencyConfig(),
      super.clone()
    );

    clone.mode = this.mode;
    clone.relatedDependencyConfigIds = this.relatedDependencyConfigIds;

    return clone;
  }
}
