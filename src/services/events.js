/**
 * Enumerates the events that may be emitted by a {@link Service}.
 *
 * @readonly
 * @enum {string}
 */
export const Events = {
  /**
   * Emitted by the service when the complete analysis state should be reset
   * to the contents of the message. (Mostly useful for T71 CLI services that
   * send the analysis state when a client connects.)
   *
   * @param {object} data The analysis state.
   */
  ANALYSIS_STATE: 'analysisState',
  /**
   * Emitted when the service manifest has changed, with the new manifest as its
   * argument.
   *
   * @param {object} manifest The new service manifest.
   */
  MANIFEST_CHANGE: 'manifestChange',
  /**
   * Emitted when the service detects a session change, with the new session
   * index (integer) as its argument.
   *
   * @param {integer} sessionIndex Numeric index of the new session.
   */
  SESSION_CHANGE: 'sessionChange',
  /**
   * Emitted when the service state has changed, with the new state as its
   * argument.
   *
   * @param {object} state The new service state.
   */
  STATE_CHANGE: 'stateChange',
  /**
   * Emitted by a service to communicate some information to the user. For
   * example, a notification that connection to the upstream data source has
   * succeeded or failed.
   *
   * @param {object} message A system message.
   */
  SYSTEM_MESSAGE: 'systemMessage'
};

export const Severity = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3
};
