import { memo, useContext, useState } from 'react';

import GitService from '@renderer/services/GitService';
import { Form } from 'fratch-ui';
import ToasterListContext from 'fratch-ui/components/Toaster/ToasterListContext';
import { c } from 'fratch-ui/helpers/classNameHelpers';
import { v4 as uuid } from 'uuid';

import LinkButton from '../../components/linkButton/LinkButton';
import useEffectCWD from './useEffectCWD';

function PackageBranchSelector({
  disabled,
  cwd,
  className,
}: {
  disabled?: boolean;
  className?: string;
  cwd: string;
}): JSX.Element {
  const [id] = useState<string>(uuid());
  const { addToaster } = useContext(ToasterListContext);

  const [branches, setBranches] = useState<
    Form.SelectProps.SelectOption<string>[]
  >([]);
  const [currenBranch, setCurrenBranch] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const loadBranches = async (): Promise<void> => {
    const branch = await GitService.getCurrentBranch(cwd);
    setCurrenBranch(branch);
    const data = await GitService.getBranches(cwd);
    setBranches(data.map(branch => ({ label: branch, value: branch })));
  };

  useEffectCWD(() => {
    (async (): Promise<void> => {
      if (cwd.length > 2) {
        setLoading(true);
        await loadBranches();
        setLoading(false);
      }
    })();
  }, cwd);

  const handleRefreshBranches = async (): Promise<void> => {
    if (cwd.length > 2 && !disabled) {
      setLoading(true);
      await GitService.fetch(cwd);
      await loadBranches();
      setLoading(false);
    }
  };

  const handleOnChange = async (value?: string): Promise<void> => {
    if (value) {
      setLoading(true);
      const { error } = await GitService.checkout(cwd, value as string);

      if (error != null && addToaster != null) {
        addToaster({
          type: 'error',
          title: `Branch ${value} checkout failed`,
          message: error.toString(),
          nlToBr: true,
        });
      }

      await loadBranches();
      setLoading(false);
    }
  };

  return (
    <div className={c(className)}>
      <Form.LeftLabeledField
        label={
          <div>
            <label htmlFor={id}>Git branch</label>
            <LinkButton
              onClick={handleRefreshBranches}
              title="update branch list"
            >
              ↻
            </LinkButton>
          </div>
        }
        field={
          <Form.Select
            id={id}
            value={currenBranch}
            placeholder={loading ? 'Loading...' : 'Select branch...'}
            searchable
            options={branches}
            onChange={handleOnChange}
            disabled={disabled || loading}
          />
        }
      />
    </div>
  );
}

export default memo(PackageBranchSelector);
