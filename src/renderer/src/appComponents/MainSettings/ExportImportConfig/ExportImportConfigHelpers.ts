import PackageBunch from '@renderer/models/PackageBunch';
import TargetPackage from '@renderer/models/TargetPackage';

export function downloadTextFile(text, name): void {
  const a = document.createElement('a');
  const type = name.split('.').pop();
  a.href = URL.createObjectURL(
    new Blob([text], { type: `text/${type === 'txt' ? 'plain' : type}` })
  );
  a.download = name;
  a.click();
}

export function parsePackageFromText(text: string): PackageBunch {
  const newBunch = new PackageBunch();
  newBunch.targetPackage = new TargetPackage();

  const data = JSON.parse(text ?? '{}');

  newBunch.name = data.name;
  newBunch.color = data.color;

  if (data.targetPackage && data.targetPackage.cwd) {
    newBunch.targetPackage = data.targetPackage;
  }

  if (
    Array.isArray(data.dependencies) &&
    data.dependencies.every(({ cwd }) => cwd)
  ) {
    newBunch.dependencies = data.dependencies;
  }

  return newBunch;
}
