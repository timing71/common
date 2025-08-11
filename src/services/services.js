import deepEqual from 'deep-equal';

import { EventEmitter } from '../eventEmitter.js';
import { MessageGenerator } from '../messages/index.js';
import { Events, Severity } from './events.js';
import { FlagState } from '../racing.js';

const DEFAULT_INITIAL_STATE = {
  cars: [],
  session: {
    flagState: FlagState.NONE
  },
  messages: []
};

/**
 * The base class for all timing service providers.
 *
 * Instantiate with a service definition. Add event listeners for the
 * {@link Events} you want to subscribe to, then call {@link #start()} with a
 * connection service.
 */
export class Service extends EventEmitter {
  /**
   * Create a new instance of this Service.
   *
   * @param {object} service A service definition (UUID, start time and source URL)
   * @param {object} initialState Initial state of the service (optional)
   */
  constructor(service, initialState = DEFAULT_INITIAL_STATE) {
    super();
    this.service = service;

    this._messageGenerator = new MessageGenerator();

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.onManifestChange = this.onManifestChange.bind(this);
    this.onSessionChange = this.onSessionChange.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.getTransientStateForSaving = this.getTransientStateForSaving.bind(this);
    this.restoreTransientState = this.restoreTransientState.bind(this);

    this._prevState = initialState;
    this.parameters = {};
  }

  onSessionChange() {
    this.service = {
      ...this.service,
      currentSessionIndex: (this.service.currentSessionIndex || 0) + 1,
      startTime: Date.now()
    };
    this.emit(Events.SESSION_CHANGE, this.service.currentSessionIndex);
  }

  onStateChange(updatedState) {
    const newState = { ...this._prevState, ...updatedState };

    const newMessages = this._messageGenerator.generate(newState.manifest, this._prevState, newState).concat(
      updatedState.extraMessages || []
    );

    const highlight = [];
    newMessages.forEach(
      nm => {
        if (nm.length >= 5) {
          highlight.push(nm[4]);
        }
      }
    );
    newState.highlight = highlight;

    newState.messages = [
      ...newMessages,
      ...(this._prevState?.messages || [])
    ].slice(0, 100);

    newState.lastUpdated = Date.now();
    delete newState.extraMessages;

    if (this.parameters && this.constructor.parametersSpec) {
      if (!newState.meta) {
        newState.meta = {};
      }
      newState.meta.parameters = this.parameters;
    }

    this.emit(Events.STATE_CHANGE, newState);
    this._prevState = newState;
  }

  /**
   * Adds start time, UUID and parameters (if appropriate) to the manifest, and
   * if a deep equality check fails, emits an event with the new manifest then
   * updates our state.
   */
  onManifestChange(newManifest) {
    const newManifestWithStartTime = {
      ...newManifest,
      startTime: this.service.startTime,
      uuid: this.service.uuid
    };

    if (this.constructor.parametersSpec) {
      newManifestWithStartTime.parameters = this.constructor.parametersSpec;
    }

    if (!deepEqual(newManifestWithStartTime, this._prevState.manifest)) {
      this.emit(Events.MANIFEST_CHANGE, newManifestWithStartTime);
      this.onStateChange({ manifest: newManifestWithStartTime });
    }
  }

  /**
   * Instructs this Service to start collecting and translating timing data.
   * @param {*} connectionService A `ConnectionService` providing data-access methods
   */
  start(connectionService) {
    this.connectionService = connectionService;
  }

  /**
   * Instructs this Service to stop collecting data, cancelling any timeouts and
   * closing any open connections.
   */
  stop() {}

  /**
   * Allows a service to persist parts of its internal, transient state
   * between instances. Will be periodically called by the service-running
   * code, which is responsible for persisting the data.
   *
   * "Internal, transient state" does not include the main service state emitted
   * by the `{@link Events#STATE_CHANGE}` event, but rather any internal structures
   * tracking data about the session that may be used to derive the service
   * state. Some timing providers, for example, don't provide "best sector time"
   * information for cars except when they have just set such a time, so a
   * service may wish to track these sector times separately.
   *
   * May optionally be implemented by subclasses; the default implementation
   * returns `undefined`.
   *
   * @returns any
  */
  getTransientStateForSaving() {
    return undefined;
  }

  /**
   * Can be called by service-running code to restore this service's internal
   * state. The provided `state` should be an object previously returned by
   * `{@link #getTransientStateForSaving}`.
   *
   * May optionally be implemented by subclasses; the default implementation
   * does nothing.
   *
   * @param {object} state
   */
  restoreTransientState(state) {
    // To optionally be implemented by subclasses
  }

  emitSystemMessage(severity, title, message, timeout = 5000) {
    this.emit(
      Events.SYSTEM_MESSAGE,
      {
        severity,
        title,
        message,
        timeout
      }
    );
  }

  emitDebug(title, message, timeout) {
    this.emitSystemMessage(Severity.DEBUG, title, message, timeout);
  }

  emitInfo(title, message, timeout) {
    this.emitSystemMessage(Severity.INFO, title, message, timeout);
  }

  emitWarning(title, message, timeout) {
    this.emitSystemMessage(Severity.WARNING, title, message, timeout);
  }

  emitError(title, message, timeout) {
    this.emitSystemMessage(Severity.ERROR, title, message, timeout);
  }
}

export class HTTPPollingService extends Service {
  constructor(url, pollInterval, service) {
    super(service);
    this.url = url;
    this.pollInterval = pollInterval;
    this.handleResponse = this.handleResponse.bind(this);
    this._fetch = this._fetch.bind(this);

    this._timeout = null;
  }

  start(connectionService) {
    super.start(connectionService);
    this._fetch();
  }

  stop() {
    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }

  async _fetch() {
    const myUrl = (typeof this.url === 'function') ? this.url() : this.url;
    try {
      const response = await this.connectionService.fetch(myUrl);
      this.handleResponse(response);
    }
    catch (e) {
      console.warn(`Failed to fetch url ${myUrl}:`, e.error); // eslint-disable-line no-console
      // We'll try again next time
    }
    finally {
      this._timeout = setTimeout(
        this._fetch,
        this.pollInterval
      );
    }
  }

  async handleResponse(response) {
    // Should be implemented by subclasses
  }
}
