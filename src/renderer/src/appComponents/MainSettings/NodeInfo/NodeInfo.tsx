import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from '../../GlobalDataProvider/useGlobalData';

import styles from './NodeInfo.module.css';

export default function NodeInfo(): JSX.Element {
  const { nodeData } = useGlobalData();
  return (
    <ul className={c(styles.node_info)}>
      {nodeData.yarn && (
        <li>
          <b>yarn</b>
          <span>{nodeData.yarn}</span>
        </li>
      )}
      {nodeData.pnpm && (
        <li>
          <b>pnpm</b>
          <span>{nodeData.pnpm}</span>
        </li>
      )}
      <li>
        <b>npm</b>
        <span>{nodeData.npm}</span>
      </li>
      {nodeData.nvm && (
        <li>
          <b>nvm</b>
          <span>{nodeData.nvm}</span>
        </li>
      )}
      <li>
        <b>node</b>
        <span>{nodeData.node}</span>
      </li>
    </ul>
  );
}
