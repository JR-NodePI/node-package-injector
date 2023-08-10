import { memo, useCallback, useContext, useEffect, useState } from 'react';

import GitService from '@renderer/services/GitService';
import { Form } from 'fratch-ui';
import ToasterListContext from 'fratch-ui/components/Toaster/ToasterListContext';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import LinkButton from '../../../components/linkButton/LinkButton';

type BranchSelectOption = Form.SelectProps.SelectOption<string>;
type BranchSelectorProps = {
  currentBranch?: string;
  disabled?: boolean;
  className?: string;
  cwd: string;
};

const isValidDirectory = (cwd: string): boolean => !/\.$/.test(cwd);

function BranchSelector({
  disabled,
  cwd,
  className,
  currentBranch,
}: BranchSelectorProps): JSX.Element {
  const [id] = useState<string>(crypto.randomUUID());
  const { addToaster } = useContext(ToasterListContext);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [branches, setBranches] = useState<BranchSelectOption[]>([]);

  const loadBranches = useCallback(
    async (abortController?: AbortController): Promise<void> => {
      const data = await GitService.getBranches(cwd, abortController);
      const newBranches = data.map(branch => ({
        label: branch,
        value: branch,
      }));
      setBranches(newBranches);
    },
    [cwd]
  );

  useEffect(() => {
    const abortController = new AbortController();

    if (isValidDirectory(cwd) && currentBranch != null) {
      setIsLoading(true);
      (async (): Promise<void> => {
        await loadBranches(abortController);
        setIsLoading(false);
      })();
    }

    return () => {
      abortController.abort();
    };
  }, [cwd, currentBranch, loadBranches]);

  const handleRefreshBranches = async (): Promise<void> => {
    if (isValidDirectory(cwd)) {
      setIsLoading(true);
      await GitService.fetch(cwd);
      await loadBranches();
      setIsLoading(false);
    }
  };

  const handleOnChange = async (value?: string): Promise<void> => {
    if (value) {
      setIsLoading(true);

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

      setIsLoading(false);
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
            value={currentBranch}
            placeholder={isLoading ? 'Loading...' : 'Select branch...'}
            searchable
            options={branches}
            onChange={handleOnChange}
            disabled={disabled || isLoading}
          />
        }
      />
    </div>
  );
}

export default memo(BranchSelector);
