import { c } from 'fratch-ui/helpers/classNameHelpers';
import { Header } from 'fratch-ui';
import { type ReactNode } from 'react';
import logo from '../../assets/logo.png';
import Footer from '../Footer/Footer';

import styles from './Layout.module.css';
export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  return (
    <section className={c(styles.layout)}>
      <Header
        iconPosition={
          window.electron.process.platform === 'darwin' ? 'right' : 'left'
        }
        title="Node Package Injector"
        iconSrc={logo}
      />
      {children}
      <Footer />
    </section>
  );
}
