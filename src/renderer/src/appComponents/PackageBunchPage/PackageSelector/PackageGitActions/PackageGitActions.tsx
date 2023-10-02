import { useCallback, useContext, useEffect, useState } from 'react';

import GitService from '@renderer/services/GitService';
import { Form } from 'fratch-ui';
import { type SelectOption } from 'fratch-ui/components/Form/Select/SelectProps';
import ToasterListContext from 'fratch-ui/components/Toaster/ToasterListContext';
import { c } from 'fratch-ui/helpers/classNameHelpers';

import PackageGitCommands from './PackageGitCommands/PackageGitCommands';

type BranchSelectOption = SelectOption<string>;
type PackageGitActionsProps = {
  disabled?: boolean;
  className?: string;
  cwd: string;
};

const isValidDirectory = (cwd: string): boolean => !/\.$/.test(cwd);

export default function PackageGitActions({
  disabled,
  cwd,
  className,
}: PackageGitActionsProps): JSX.Element {
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
      setIsLoading(true);

      const data = await GitService.getBranches(cwd, abortController);
      const newBranches = data.map(branch => ({
        label: branch,
        value: branch,
      }));

      setBranches(newBranches);
      setIsLoading(false);
    },
    [cwd]
  );

  // load all branches
  useEffect(() => {
    const abortController = new AbortController();

    if (isValidDirectory(cwd) && gitBranch != null) {
      (async (): Promise<void> => {
        await loadBranches(abortController);
      })();
    }

    return () => {
      abortController.abort();
    };
  }, [cwd, gitBranch, loadBranches]);

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
    <>
      <div className={c(className)}>
        <Form.LeftLabeledField
          label={<label htmlFor={id}>Git branch</label>}
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
      <PackageGitCommands cwd={cwd} loadBranches={loadBranches} />
    </>
  );
}
