export const GIT_COMMANDS = {
  pull: {
    label: 'git pull',
    commands: ['pull'],
    needsConfirmation: false,
  } as const,
  fetch: {
    label: 'git fetch',
    commands: ['fetch'],
    needsConfirmation: false,
  } as const,
  clean: {
    label: 'git clean',
    commands: [
      ['clean', '-df'],
      ['checkout', '--', '.'],
    ] as const,
    needsConfirmation: true,
  } as const,
  reset: {
    label: 'git hard reset ~1',
    commands: [['reset', '--hard', 'HEAD~1']],
    needsConfirmation: true,
  } as const,
} as const;
