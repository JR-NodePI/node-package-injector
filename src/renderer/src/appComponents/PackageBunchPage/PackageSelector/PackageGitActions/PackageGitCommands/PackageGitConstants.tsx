export const GIT_COMMANDS = {
  pull: { label: 'git pull', value: 'pull', needsConfirmation: false } as const,
  fetch: {
    label: 'git fetch',
    value: 'fetch',
    needsConfirmation: false,
  } as const,
  clean: {
    label: 'git checkout .',
    value: ['checkout', '.'],
    needsConfirmation: true,
  } as const,
  reset: {
    label: 'git reset --hard HEAD~1',
    value: ['reset', '--hard', 'HEAD~1'],
    needsConfirmation: true,
  } as const,
} as const;
