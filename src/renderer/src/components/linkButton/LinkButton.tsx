import { c } from 'fratch-ui/helpers';

import styles from './LinkButton.module.css';

export default function LinkButton({
  children,
  className,
  onClick,
  title,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
  title?: string;
}): JSX.Element {
  const handleOnClick = (
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ): void => {
    event.preventDefault();
    onClick?.(event);
  };
  return (
    <a
      href="#"
      className={c(styles.link_button, className)}
      onClick={handleOnClick}
      title={title}
    >
      {children}
    </a>
  );
}
