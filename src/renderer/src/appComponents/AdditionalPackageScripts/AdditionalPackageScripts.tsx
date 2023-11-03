import { useEffect } from 'react';

import PackageScript from '@renderer/models/PackageScript';
import { InputText } from 'fratch-ui/components';
import { c } from 'fratch-ui/helpers';

import useGlobalData from '../GlobalDataProvider/useGlobalData';
import PackageScriptButtons from '../PackageBunchPage/PackageSelector/PackageScripts/components/PackageScriptButtons';

import styles from './AdditionalPackageScripts.module.css';

export default function AdditionalPackageScripts(): JSX.Element {
  const { additionalPackageScripts, setAdditionalPackageScripts } =
    useGlobalData();

  useEffect(() => {
    if (!additionalPackageScripts.length) {
      setAdditionalPackageScripts?.([new PackageScript()]);
    }
  }, [additionalPackageScripts.length, setAdditionalPackageScripts]);

  const handleAdd = (): void => {
    const newScripts = [...additionalPackageScripts, new PackageScript()];
    setAdditionalPackageScripts?.(newScripts);
  };

  const handleRemove = (index: number): void => {
    const newScripts = additionalPackageScripts.filter(
      (_script, scriptIndex) => scriptIndex !== index
    );
    setAdditionalPackageScripts?.(newScripts);
  };

  const handleChangeName = (
    index: number,
    event?: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const scriptName = event?.target.value ?? '';
    const newScripts = additionalPackageScripts.map((script, scriptIndex) => {
      if (index === scriptIndex) {
        const newScript = script.clone();
        newScript.scriptName = scriptName;
        return newScript;
      }
      return script;
    });
    setAdditionalPackageScripts?.(newScripts);
  };

  const handleChangeValue = (
    index: number,
    event?: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const scriptValue = event?.target.value ?? '';
    const newScripts = additionalPackageScripts.map((script, scriptIndex) => {
      if (index === scriptIndex) {
        const newScript = script.clone();
        newScript.scriptValue = scriptValue;
        return newScript;
      }
      return script;
    });
    setAdditionalPackageScripts?.(newScripts);
  };

  return (
    <div className={c(styles.wrapper)}>
      <p className={c(styles.title)}>🤖 custom package scripts</p>
      <div className={c(styles.overflow)}>
        {additionalPackageScripts.map(({ scriptName, scriptValue }, index) => {
          const showAddButton = index === additionalPackageScripts.length - 1;

          return (
            <div key={index} className={c(styles.script)}>
              <InputText
                className={c(styles.script_name)}
                cleanable
                placeholder="Script name"
                value={scriptName}
                onChange={(event): void => handleChangeName(index, event)}
                title={scriptName}
              />
              <InputText
                className={c(styles.script_value)}
                cleanable
                placeholder="Script vale"
                value={scriptValue}
                onChange={(event): void => handleChangeValue(index, event)}
                title={scriptValue}
              />
              <PackageScriptButtons
                index={index}
                onAdd={handleAdd}
                onRemove={handleRemove}
                showAddButton={showAddButton}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
