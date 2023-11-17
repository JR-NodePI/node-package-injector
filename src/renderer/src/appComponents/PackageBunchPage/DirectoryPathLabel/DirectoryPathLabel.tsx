import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import PathService from '@renderer/services/PathService';
import { c } from 'fratch-ui/helpers';

import LinkButton from '../../../components/linkButton/LinkButton';

import styles from './DirectoryPathLabel.module.css';

type PackageSelectorLabelProps = {
  id: string;
  isDirBackEnabled: boolean;
  pathDirectories: string[];
  handleOnClickBack: () => void;
};

export default function DirectoryPathLabel({
  id,
  handleOnClickBack,
  isDirBackEnabled,
  pathDirectories,
}: PackageSelectorLabelProps): JSX.Element {
  const { homePath } = useGlobalData();

  const rootPath =
    pathDirectories.length > 1
      ? PathService.getPath(pathDirectories.slice(0, -1))
      : '';

  const lastDirectory =
    pathDirectories.length > 1 ? pathDirectories.slice(-1)[0] : '';

  const shortRootPath = rootPath.replace(homePath, '~');

  return (
    <>
      <label className={c(styles.label)} htmlFor={id}>
        {PathService.normalizeWin32Path(shortRootPath)}
        {isDirBackEnabled ? (
          <b className={c(styles.label_last_directory)}>{lastDirectory}</b>
        ) : (
          <>{lastDirectory}</>
        )}
      </label>
      {isDirBackEnabled && (
        <LinkButton title="go back to previous" onClick={handleOnClickBack}>
          ../
        </LinkButton>
      )}
    </>
  );
}
