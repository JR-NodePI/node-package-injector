import PackageConfig from './PackageConfig';

export const DependencyMode = {
  BUILD: 'build' as const,
  SYNC: 'sync' as const,
};

export default class DependencyConfig extends PackageConfig {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] = DependencyMode.BUILD;

  private _targetDependenciesOnBuild: DependencyConfig[] = [];

  public addTargetDependency(dependency: DependencyConfig): void {
    this._targetDependenciesOnBuild?.push(dependency);
  }

  get targetDependenciesOnBuild(): DependencyConfig[] {
    return this._targetDependenciesOnBuild;
  }

  public clone(): DependencyConfig {
    const clone: DependencyConfig = Object.assign(new DependencyConfig(), super.clone());

    clone.mode = this.mode;
    clone._targetDependenciesOnBuild = this._targetDependenciesOnBuild;

    return clone;
  }
}
