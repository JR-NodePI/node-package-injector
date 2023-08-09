import { c } from 'fratch-ui/helpers/classNameHelpers';

import ExportConfig from './ExportConfig';
import ImportConfig from './ImportConfig';

import styles from './ConfigSharing.module.css';

export default function ConfigSharing(): JSX.Element {
  return (
    <div className={c(styles.config_sharing)}>
      <ImportConfig />
      <ExportConfig />
    </div>
  );
}
