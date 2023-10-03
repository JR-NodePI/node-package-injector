import { type ReactNode } from 'react';

import useGlobalData from '@renderer/appComponents/GlobalDataProvider/useGlobalData';
import { Header } from 'fratch-ui';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import RunProcess from '../../appComponents/RunProcess/RunProcess';
import logo from '../../assets/logo.png';
import Footer from '../Footer/Footer';

import styles from './Layout.module.css';

export default function Layout({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const { isWSLActive } = useGlobalData();

  const witAppHeader = window.electron.process.platform !== 'linux';
  const headerIconPosition =
    window.electron.process.platform === 'darwin' ? 'right' : 'left';

  const title = isWSLActive
    ? `${import.meta.env.APP_TITLE} ⚡WSL`
    : import.meta.env.APP_TITLE;

  return (
    <section
      className={c(styles.layout, witAppHeader ? styles.with_header : '')}
    >
      {witAppHeader && (
        <div className={c(styles.header_area)}>
          <Header
            iconPosition={headerIconPosition}
            title={title}
            iconSrc={logo}
          />
        </div>
      )}

      <section className={c(styles.content)}>{children}</section>
      <Footer>
        <RunProcess />
      </Footer>
    </section>
  );
}
