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

export const Events = {
  MANIFEST_CHANGE: 'manifestChange',
  SESSION_CHANGE: 'sessionChange',
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

  // Adds start time and UUID to the manifest, and if a deep equality check fails,
  // emits an event with the new manifest then updates our state.
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
