import deepEqual from 'deep-equal';

import { EventEmitter } from './eventEmitter.js';
import { generateMessages } from './messages/index.js';

export const SERVICE_PROVIDERS = [];

export const registerServiceProvider = (serviceClass) => {
  if (!SERVICE_PROVIDERS.includes(serviceClass)) {
    SERVICE_PROVIDERS.push(serviceClass);
  }
};

export const serviceProviderCount = () => SERVICE_PROVIDERS.length;

export const mapServiceProvider = (source) => {
  if (source.slice(0, 4) === 't71 ') {
    const providerClass = source.slice(4, source.indexOf(':'));
    for (let i = 0; i < SERVICE_PROVIDERS.length; i++) {
      if (SERVICE_PROVIDERS[i].name === providerClass) {
        return SERVICE_PROVIDERS[i];
      }
    }
  }

  for (let i = 0; i < SERVICE_PROVIDERS.length; i++) {
    if (source.search(SERVICE_PROVIDERS[i].regex) >= 0) {
      return SERVICE_PROVIDERS[i];
    }
  }
};

/**
 * Enumerates the events that may be emitted by a {@link Service}.
 */
export const Events = {
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
  STATE_CHANGE: 'stateChange'
};

export class Service extends EventEmitter {
  constructor(service, initialState = {}) {
    super();
    this.service = service;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);

    this.onManifestChange = this.onManifestChange.bind(this);
    this.onSessionChange = this.onSessionChange.bind(this);
    this.onStateChange = this.onStateChange.bind(this);
    this.getTransientStateForSaving = this.getTransientStateForSaving.bind(this);
    this.restoreTransientState = this.restoreTransientState.bind(this);

    this._prevState = initialState;
  }

  onSessionChange() {
    this.service = {
      ...this.service,
      currentSessionIndex: (this.service.currentSessionIndex || 0) + 1
    };
    this.emit(Events.SESSION_CHANGE, this.service.currentSessionIndex);
  }

  onStateChange(updatedState) {
    const newState = { ...this._prevState, ...updatedState };

    const newMessages = generateMessages(newState.manifest, this._prevState, newState).concat(
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

    this.emit(Events.STATE_CHANGE, newState);
    this._prevState = newState;
  }

  /**
   * Adds start time and UUID to the manifest, and if a deep equality check
   * fails, emits an event with the new manifest then updates our state.
   */
  onManifestChange(newManifest) {
    const newManifestWithStartTime = {
      ...newManifest,
      startTime: this.service.startTime,
      uuid: this.service.uuid
    };

    if (!deepEqual(newManifestWithStartTime, this._prevState.manifest)) {
      this.emit(Events.MANIFEST_CHANGE, newManifestWithStartTime);
      this.onStateChange({ manifest: newManifestWithStartTime });
    }
  }

  start(connectionService) {
    this.connectionService = connectionService;
  }

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
