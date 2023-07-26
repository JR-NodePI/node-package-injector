import { v4 as uuid } from 'uuid';

import type DependencyConfig from './DependencyConfig';
import PackageConfig from './PackageConfig';

export default class PackageConfigBunch {
  public id = uuid();
  public name?: string;
  public active = false;
  public packageConfig: PackageConfig = new PackageConfig();
  public dependencies: DependencyConfig[] = [];

  public clone(): PackageConfigBunch {
    const clone = new PackageConfigBunch();

    clone.id = this.id;
    clone.name = this.name;
    clone.active = this.active;
    clone.packageConfig = this.packageConfig;
    clone.dependencies = this.dependencies;

    return clone;
  }
}
