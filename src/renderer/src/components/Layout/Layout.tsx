import { type ReactNode } from 'react';

import { Header } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import logo from '../../assets/logo.png';
import Footer from '../Footer/Footer';
import Process from '../Process/Process';

import styles from './Layout.module.css';

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const headerIconPosition =
    window.electron.process.platform === 'darwin' ? 'right' : 'left';

  return (
    <section className={c(styles.layout)}>
      <Header
        iconPosition={headerIconPosition}
        title="Node Package Injector"
        iconSrc={logo}
      />
      <section className={c(styles.content)}>{children}</section>
      <Footer>
        <Process />
      </Footer>
    </section>
  );
}
