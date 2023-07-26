import { v4 as uuid } from 'uuid';

import type DependencyConfig from './DependencyConfig';
import PackageConfig from './PackageConfig';

export default class PackageConfigBunch {
  public readonly id = uuid();
  public name?: string;
  public packageConfig: PackageConfig = new PackageConfig();
  public dependencies: DependencyConfig[] = [];
}
