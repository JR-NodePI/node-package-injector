import { memo, useContext, useEffect, useState } from 'react';

import GitService from '@renderer/services/GitService';
import type { SelectProps } from 'fratch-ui/components';
import { LeftLabeledField, Select } from 'fratch-ui/components';
import ToasterListContext from 'fratch-ui/components/Toaster/ToasterListContext';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import LinkButton from '../linkButton/LinkButton';

function BranchSelector({
  disabled,
  cwd,
  className,
}: {
  disabled?: boolean;
  className?: string;
  cwd: string;
}): JSX.Element {
  const { addToaster } = useContext(ToasterListContext);

  const [branches, setBranches] = useState<SelectProps.SelectOption<string>[]>(
    []
  );
  const [currenBranch, setCurrenBranch] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  const loadBranches = async (): Promise<void> => {
    const branch = await GitService.getCurrentBranch(cwd);
    setCurrenBranch(branch);
    const data = await GitService.getBranches(cwd);
    setBranches(data.map(branch => ({ label: branch, value: branch })));
  };

  useEffect(() => {
    (async (): Promise<void> => {
      if (cwd.length > 2 && !disabled) {
        setLoading(true);
        await loadBranches();
        setLoading(false);
      }
    })();
  }, [cwd, disabled]);

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
      <LeftLabeledField
        label={
          <div>
            <label>Git branch</label>
            <LinkButton
              onClick={handleRefreshBranches}
              title="update branch list"
            >
              ↻
            </LinkButton>
          </div>
        }
        field={
          <Select
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

export default memo(BranchSelector);
