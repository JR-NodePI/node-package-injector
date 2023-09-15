import { memo, useCallback, useContext, useEffect, useState } from 'react';

import { Form } from 'fratch-ui';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import ToasterListContext from 'fratch-ui/components/Toaster/ToasterListContext';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import GitService from '@renderer/services/GitService';

import LinkButton from '../../../components/linkButton/LinkButton';

type BranchSelectOption = SelectOption<string>;
type BranchSelectorProps = {
  disabled?: boolean;
  className?: string;
  cwd: string;
};

const isValidDirectory = (cwd: string): boolean => !/\.$/.test(cwd);

function BranchSelector({
  disabled,
  cwd,
  className,
}: BranchSelectorProps): JSX.Element {
  const [id] = useState<string>(crypto.randomUUID());
  const { addToaster } = useContext(ToasterListContext);

  const [gitBranch, setGitBranch] = useState<string>();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [branches, setBranches] = useState<BranchSelectOption[]>([]);

  // load current branch
  useEffect(() => {
    const abortController = new AbortController();

    (async (): Promise<void> => {
      if (isValidDirectory(cwd)) {
        setGitBranch(await GitService.getCurrentBranch(cwd, abortController));
      }
    })();

    return () => {
      abortController.abort();
    };
  }, [cwd]);

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

  // load all branches
  useEffect(() => {
    const abortController = new AbortController();

    if (isValidDirectory(cwd) && gitBranch != null) {
      setIsLoading(true);
      (async (): Promise<void> => {
        await loadBranches(abortController);
        setIsLoading(false);
      })();
    }

    return () => {
      abortController.abort();
    };
  }, [cwd, gitBranch, loadBranches]);

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
      } else {
        setGitBranch(value);
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
            value={gitBranch}
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
