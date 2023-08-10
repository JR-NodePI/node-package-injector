import { DependencyMode } from '@renderer/models/DependencyConstants';

import TargetPackage from './TargetPackage';

export default class DependencyPackage extends TargetPackage {
  public mode: (typeof DependencyMode)[keyof typeof DependencyMode] =
    DependencyMode.BUILD;
}
