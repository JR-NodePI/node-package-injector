export const ExecuteCommandOutputType = {
  STDOUT: 'stdout',
  STDERR_WARN: 'stderr_warn',
  STDERR_ERROR: 'stderr_error',
  CLOSE: 'close',
  EXIT: 'exit',
  ERROR: 'error',
  INIT: 'init',
} as const;

export const OutputColor = '#5858f0';

export const OutputTypeToColor = {
  [ExecuteCommandOutputType.STDOUT]: '#007390',
  [ExecuteCommandOutputType.STDERR_WARN]: '#ffa600',
  [ExecuteCommandOutputType.STDERR_ERROR]: '#d70065',
  [ExecuteCommandOutputType.CLOSE]: '#6da800',
  [ExecuteCommandOutputType.EXIT]: '#6da800',
  [ExecuteCommandOutputType.ERROR]: '#d70065',
  [ExecuteCommandOutputType.INIT]: '#3ba93b',
} as const;

export const OutputGoodIcons = [
  '✌',
  '👏',
  '👑',
  '💃',
  '💋',
  '💎',
  '💘',
  '💚',
  '💛',
  '💪',
  '😀',
  '😁',
  '😂',
  '😃',
  '😇',
  '😍',
  '😎',
  '😘',
  '🚀',
];
export const OutputBadIcons = [
  '👹',
  '👺',
  '👻',
  '👿',
  '💀',
  '💥',
  '💩',
  '💨',
  '😠',
  '😡',
  '😢',
  '😣',
  '😤',
  '😥',
  '😨',
];
export const OutputNeutralIcons = [
  '👀',
  '👊',
  '👋',
  '👶',
  '💦',
  '🔥',
  '🙈',
  '🙉',
  '🙊',
  '🛀',
];
