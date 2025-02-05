import { parseModel } from '@renderer/helpers/parseHelpers';
import {
  packageBunchTemplate,
  packageScriptsTemplate,
} from '@renderer/models/GlobalDataConstants';
import type PackageBunch from '@renderer/models/PackageBunch';
import type PackageScript from '@renderer/models/PackageScript';
import PathService from '@renderer/services/PathService';

const HOME_WILDCARD = '<<HOME>>';

const addHomeWildcard = async (
  text: string,
  isWSLActive?: boolean
): Promise<string> => {
  const home = await PathService.getHomePath(isWSLActive);
  const homePattern = home.replace(/[\\$]+/g, '[^"]+');
  const cleanText = text.replace(
    new RegExp(`${homePattern}`, 'g'),
    HOME_WILDCARD
  );
  return cleanText;
};

export async function downloadTextFile(
  text: string,
  name: string,
  isWSLActive?: boolean
): Promise<void> {
  const cleanText = await addHomeWildcard(text, isWSLActive);
  const a = document.createElement('a');
  const type = name.split('.').pop();
  a.href = URL.createObjectURL(
    new Blob([cleanText], { type: `text/${type === 'txt' ? 'plain' : type}` })
  );
  a.download = name;
  a.click();
}

const replaceHomeWildcard = async (
  text: string,
  isWSLActive?: boolean
): Promise<string> => {
  const home = await PathService.getHomePath(isWSLActive);
  const homePattern = JSON.stringify(home).replace(/"/g, '');
  const cleanText = text.replace(
    new RegExp(`${HOME_WILDCARD}`, 'g'),
    homePattern
  );
  return cleanText;
};

export async function getPackageBunchFromText(
  text: string,
  isWSLActive?: boolean
): Promise<PackageBunch | null> {
  const jsonWithHome = await replaceHomeWildcard(text, isWSLActive);
  const fileData = JSON.parse(jsonWithHome);
  const parsedBunch = parseModel<PackageBunch>(
    fileData.activePackageBunch ?? fileData,
    packageBunchTemplate
  );

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

export async function getAdditionalScriptsFromText(
  text: string
): Promise<PackageScript[] | null> {
  const fileData = JSON.parse(text);
  const parsedAdditionalPackageScripts = parseModel<PackageScript[]>(
    fileData.additionalPackageScripts,
    packageScriptsTemplate
  );

  const isValidScriptsList =
    parsedAdditionalPackageScripts?.[0]?.scriptName != null;
  parsedAdditionalPackageScripts?.[0]?.scriptValue != null;

  if (!isValidScriptsList) {
    return null;
  }

  return parsedAdditionalPackageScripts;
}
