export const formatNumber = (num: number): string =>
  new Intl.NumberFormat(navigator.language || 'en-US').format(num);
