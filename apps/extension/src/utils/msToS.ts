export const msToS = (value: number | null) =>
  value ? +(value / 1000).toFixed(0) : 0;
