import { c } from 'fratch-ui/helpers';

import LinkButton from '../../../components/linkButton/LinkButton';

import styles from './PackageSelector.module.css';

type PackageSelectorLabelProps = {
  id: string;
  rootPath: string;
  lastDirectory: string;
  isDirBackEnabled: boolean;
  handleOnClickBack: () => void;
};

export default function PackageSelectorLabel({
  id,
  rootPath,
  lastDirectory,
  isDirBackEnabled,
  handleOnClickBack,
}: PackageSelectorLabelProps): JSX.Element {
  return (
    <>
      <label className={c(styles.label)} htmlFor={id}>
        {rootPath}
        <b>{lastDirectory}</b>
      </label>
      {isDirBackEnabled && (
        <LinkButton title="go back to previous" onClick={handleOnClickBack}>
          ../
        </LinkButton>
      )}
    </>
  );
}
