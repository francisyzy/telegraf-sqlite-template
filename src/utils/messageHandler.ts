/**
 * Escape MarkdownV2 Characters
 * @param {string} str - The string with characters to escape
 * @return {string} Escaped strings
 */
export function toEscapeMsg(str: string): string {
  return str
    .replace(/_/gi, "\\_")
    .replace(/-/gi, "\\-")
    .replace("+", "\\+")
    .replace("=", "\\=")
    .replace("~", "\\~")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/\</g, "\\<")
    .replace(/\>/g, "\\>")
    .replace(/!/gi, "\\!")
    .replace(/`/gi, "\\`")
    .replace(/\./g, "\\.");
}
