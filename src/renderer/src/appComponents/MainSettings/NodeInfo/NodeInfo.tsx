import { c } from 'fratch-ui/helpers/classNameHelpers';

import useGlobalData from '../../GlobalDataProvider/useGlobalData';

import styles from './NodeInfo.module.css';

export default function NodeInfo(): JSX.Element {
  const { nodeData } = useGlobalData();
  return (
    <ul className={c(styles.node_info)}>
      <li>
        <b>node</b>
        <span>{nodeData.node}</span>
      </li>
      <li>
        <b>npm</b>
        <span>{nodeData.npm}</span>
      </li>
      {nodeData.yarn && (
        <li>
          <b>yarn</b>
          <span>{nodeData.yarn}</span>
        </li>
      )}
    </ul>
  );
}
