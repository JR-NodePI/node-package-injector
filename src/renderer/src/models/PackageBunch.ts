import { CSSProperties } from 'react';

import { v4 as uuid } from 'uuid';

import type DependencyPackage from './DependencyPackage';
import TargetPackage from './TargetPackage';

export default class PackageBunch {
  public id = uuid();
  public name?: string;
  public color?: CSSProperties['color'];
  public active = false;
  public targetPackage: TargetPackage = new TargetPackage();
  public dependencies: DependencyPackage[] = [];

  public clone(): PackageBunch {
    const clone = new PackageBunch();

    clone.id = this.id;
    clone.name = this.name;
    clone.color = this.color;
    clone.active = this.active;
    clone.targetPackage = this.targetPackage;
    clone.dependencies = this.dependencies;

    return clone;
  }
}
