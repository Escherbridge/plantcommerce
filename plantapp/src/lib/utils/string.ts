/**
 * Escapes wildcard characters for a `like` query.
 * @param str The string to escape.
 * @returns The escaped string.
 */
export function sanitizeLike(str: string): string {
  return str.replace(/%/g, '\\%').replace(/_/g, '\\_');
}