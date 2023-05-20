export * from './events.js';
export * from './services.js';

export const SERVICE_PROVIDERS = [];

/**
 * Call with a {@link Service} class (not an instance) to add that service to the
 * provider registry. You need to do this once for each service class you wish
 * to add, typically during the initialisation of your program.
 *
 * @param {Service} serviceClass A class that extends {@link Service}.
 */
export function registerServiceProvider(serviceClass) {
  if (!SERVICE_PROVIDERS.includes(serviceClass)) {
    SERVICE_PROVIDERS.push(serviceClass);
  }
};

/**
 * Return the number of service providers currently registered.
 * @returns integer
 */
export function serviceProviderCount() {
  return SERVICE_PROVIDERS.length;
}

/**
 *
 * @param {string} source Source URL for timing data
 * @returns {Source | null} The service provider corresponding to the source URL
 *   if one exists, or `null` otherwise.
 */
export function mapServiceProvider(source) {
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
