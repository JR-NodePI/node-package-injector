import { type ReactNode } from 'react';

import { c } from 'fratch-ui/helpers/classNameHelpers';

import styles from './Footer.module.css';

function Footer({ children }: { children: ReactNode }): JSX.Element {
  return <footer className={c(styles.footer)}>{children}</footer>;
}

export default Footer;
