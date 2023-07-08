import GitService from '@renderer/services/GitService';

import { memo, useEffect, useState } from 'react';
import type { SelectProps } from 'fratch-ui/components';
import { Select, LeftLabeledField } from 'fratch-ui/components';

type BranchSelectorProps = {
  cwd: string;
  onChange?: (branch?: string) => void;
  value?: string;
  className?: string;
};

function BranchSelector({ cwd, onChange, value, className }: BranchSelectorProps): JSX.Element {
  const [branches, setBranches] = useState<SelectProps.SelectOption<string>[]>([]);
  const [currenBranch, setCurrenBranch] = useState<string>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async (): Promise<void> => {
      setLoading(true);
      const branch = await GitService.getCurrentBranch(cwd);
      setCurrenBranch(branch);
      const data = await GitService.getBranches(cwd);
      setBranches(data.map(branch => ({ label: branch, value: branch })));
      setLoading(false);
    })();
  }, [cwd]);

  if (loading) {
    return <>Loading...</>;
  }

  const currentValue = value || currenBranch;
  if (branches.length <= 0 || !currentValue) {
    return <></>;
  }

  return (
    <LeftLabeledField
      className={className}
      label={<label>Git branch</label>}
      field={
        <Select
          value={currentValue}
          placeholder="Select branch ..."
          searchable
          options={branches}
          onChange={onChange}
        />
      }
    />
  );
}

export default memo(BranchSelector);
