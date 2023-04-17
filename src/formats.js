/**
 * Attempts to parse a time in seconds from its input.
 * @param {any} seconds Value to parse
 * @param {number} places Number of decimal places to display
 * @returns {number | any} A number if possible, else returns its input.
 */
export function timeInSeconds(seconds, places = 3) {
  if (isNaN(seconds) || seconds === '' || seconds === null) {
    return seconds;
  }

  seconds = parseFloat(seconds);

  const negate = seconds < 0 ? '-' : '';
  seconds = Math.abs(seconds);

  if (seconds < 60) {
    return `${negate}${seconds.toFixed(places)}`;
  }
  const minutes = Math.floor(seconds / 60);
  seconds = (seconds - (60 * minutes)).toFixed(places);

  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  return `${negate}${minutes}:${seconds}`;
};

/**
 * Format a time in seconds to HH:MM:SS, allowing HH to be > 23 if needed.
 * @param {number} seconds
 * @returns {string} Formatted time HH:MM:SS.
 */
export function timeWithHours(seconds) {
  let hours = Math.floor(seconds / 3600);
  seconds -= (3600 * hours);
  let minutes = Math.floor(seconds / 60);
  seconds = Math.floor(seconds - (60 * minutes));
  if (hours < 10) {
    hours = '0' + hours;
  }
  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  if (seconds < 10) {
    seconds = '0' + seconds;
  }

  return hours + ':' + minutes + ':' + seconds;
};
