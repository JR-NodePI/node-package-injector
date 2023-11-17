import { parseModel } from '@renderer/helpers/parseHelpers';
import { packageBunchTemplate } from '@renderer/models/GlobalDataConstants';
import type PackageBunch from '@renderer/models/PackageBunch';

export function downloadTextFile(text, name): void {
  const a = document.createElement('a');
  const type = name.split('.').pop();
  a.href = URL.createObjectURL(
    new Blob([text], { type: `text/${type === 'txt' ? 'plain' : type}` })
  );
  a.download = name;
  a.click();
}

export function getPackageBunchFromText(text: string): PackageBunch | null {
  const fileData = JSON.parse(text);

  const parsedBunch = parseModel<PackageBunch>(fileData, packageBunchTemplate);

  const isValidTargetPackage =
    parsedBunch.targetPackage.cwd != null &&
    parsedBunch.targetPackage.isValidPackage === true;
  const areValidDependencies =
    parsedBunch.dependencies.length === 0 ||
    parsedBunch.dependencies.every(
      ({ cwd, isValidPackage }) => cwd != null && isValidPackage === true
    );
  const isValidBunch =
    parsedBunch.name != null &&
    parsedBunch.color != null &&
    isValidTargetPackage &&
    areValidDependencies;

  if (!isValidBunch) {
    return null;
  }

  return parsedBunch;
}
