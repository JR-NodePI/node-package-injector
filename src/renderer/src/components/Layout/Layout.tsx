import { type ReactNode } from 'react';

import useGlobalData from '@renderer/App/GlobalDataProvider/useGlobalData';
import { Header } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import Process from '../../App/Process/Process';
import logo from '../../assets/logo.png';
import Footer from '../Footer/Footer';

import styles from './Layout.module.css';

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { isWSLActive } = useGlobalData();
  const headerIconPosition =
    window.electron.process.platform === 'darwin' ? 'right' : 'left';

  const title = isWSLActive
    ? `${import.meta.env.APP_TITLE} ⚡WSL`
    : import.meta.env.APP_TITLE;

  return (
    <section className={c(styles.layout)}>
      <Header iconPosition={headerIconPosition} title={title} iconSrc={logo} />
      <section className={c(styles.content)}>{children}</section>
      <Footer>
        <Process />
      </Footer>
    </section>
  );
}
