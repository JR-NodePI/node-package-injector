import { c } from 'fratch-ui/helpers';

import ExportConfig from './ExportConfig';
import ImportConfig from './ImportConfig';

import styles from './ExportImportBunch.module.css';

export default function ExportImportBunch(): JSX.Element {
  return (
    <div className={c(styles.config_sharing)}>
      <ImportConfig />
      <ExportConfig />
    </div>
  );
}
