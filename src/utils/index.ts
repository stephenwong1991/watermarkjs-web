/**
 * Determine if something is a non-infinite javascript number.
 * @param  {Number}  n A (potential) number to see if it is a number.
 * @return {Boolean} True for non-infinite numbers, false for all else.
 */
export function isNumber(n: unknown): boolean {
  return !isNaN(parseFloat(n as string)) && isFinite(n as number);
}
