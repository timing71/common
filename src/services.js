import deepEqual from "deep-equal";

import { generateMessages } from "./messages/index.js";

export const SERVICE_PROVIDERS = [];

export const registerServiceProvider = (serviceClass) => {
  if (!SERVICE_PROVIDERS.includes(serviceClass)) {
    SERVICE_PROVIDERS.push(serviceClass);
  }
}

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

export const processStateUpdate = (oldState, updatedState) => {
  const newState = { ...oldState, ...updatedState };

  const newMessages = generateMessages(newState.manifest, oldState, newState).concat(
    updatedState.extraMessages || [],
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
    ...(oldState?.messages || [])
  ].slice(0, 100);

  newState.lastUpdated = Date.now();
  delete newState.extraMessages;

  return newState;
};

// Adds start time and UUID to the manifest, and if a deep equality check fails,
// calls `callback` with the new manifest.
export const processManifestUpdate = (oldManifest, newManifest, startTime, uuid, callback) => {
  const newManifestWithStartTime = {
    ...newManifest,
    startTime: startTime,
    uuid
  };

  if (!deepEqual(newManifestWithStartTime, oldManifest)) {
    callback(newManifestWithStartTime);
  }
};

export class Service {
  constructor(onStateChange, onManifestChange, service) {
    this.onManifestChange = onManifestChange;
    this.onStateChange = onStateChange;
    this.service = service;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
  }

  start(connectionService) {
    this.connectionService = connectionService;
  }
  stop() {}
}

export class HTTPPollingService extends Service {
  constructor(url, pollInterval, onStateChange, onManifestChange, service) {
    super(onStateChange, onManifestChange, service);
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
    const myUrl = (typeof(this.url) === 'function') ? this.url() : this.url;
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
