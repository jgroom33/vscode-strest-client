const FIND_KEY_REGEX = /^\s*[\-|\s]?([\w|\s|\~\(|\)]*):.*/;

/**
 * Check if the line is empty string or only whitespace(s) or not
 * @param {String} str Line in yaml file
 */
export function isEmptyOrWhitespace(str) {
  const spaces = str.match(/\s/g) || '';
  return str === '' || spaces.length === str.length;
}

/**
 * Check if the line is a comment line or not
 * @param {String} str Line in yaml file
 */
export function isCommentLine(str) {
  return !!str.match(/^\s*#/);
}

/**
 * Check if the line contains a key or not
 * @param {String} str Line in yaml file
 */
export function isKey(str) {
  return !!str.match(FIND_KEY_REGEX);
}

/**
 * Find the closet key
 * @param {String} selectedLineText Text of selected line
 * @param {Array} lines Lines from first line to selected line
 */
export function findLineOfClosestKey(selectedLineText, lines) {
  return lines
    .filter((line) => !isCommentLine(line) && isKey(line))
    .pop();
}

/**
 * Get the spaces of the string, if it doesn't contain
 * spaces, it will return an array with empty string.
 * @param {String} str Line in yaml file
 */
export function textIndentations(str) {
  return (str.match(/^\s*/) || [''])[0];
}

/**
 * Function to filter unnecessary lines, including empty line,
 * line with only whitespace(s) and comment line
 * @param {String} line Line in yaml file
 */
export function isUnnecessaryLine(line) {
  return !isEmptyOrWhitespace(line) && !isCommentLine(line);
}
