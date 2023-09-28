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
  [ExecuteCommandOutputType.STDERR_WARN]: '#faa200',
  [ExecuteCommandOutputType.STDERR_ERROR]: '#c9022d',
  [ExecuteCommandOutputType.CLOSE]: '#0047cc',
  [ExecuteCommandOutputType.EXIT]: '#0047cc',
  [ExecuteCommandOutputType.ERROR]: '#c90248',
  [ExecuteCommandOutputType.INIT]: '#3ba93b',
} as const;

export const OutputIcons = [
  '👋',
  '👑',
  '👏',
  '💃',
  '💋',
  '💎',
  '💘',
  '💚',
  '😀',
  '💛',
  '💪',
  '😂',
  '😍',
  '🚀',
  '👹',
  '😁',
  '👻',
  '💥',
  '💩',
  '😎',
  '💨',
  '😤',
  '😨',
  '👊',
  '👋',
  '💦',
  '🔥',
  '😃',
  '🖖',
  '🎯',
  '🤡',
  '😇',
  '🍆',
  '🍑',
  '😘',
  '⛺',
  '🛎️',
];
