import { EventEmitter } from '../eventEmitter.js';

const SECONDS = 1000;

export class Watchdog extends EventEmitter {
  constructor(timeout = 30 * SECONDS) {
    super();
    this.timeout = timeout;
    this._to = null;

    this.start = this.start.bind(this);
    this.stop = this.stop.bind(this);
    this.dataReceived = this.dataReceived.bind(this);
    this.onTimeout = this.onTimeout.bind(this);
  }

  start() {
    this._to = setTimeout(this.onTimeout, this.timeout);
  }

  stop() {
    if (this._to) {
      clearTimeout(this._to);
    }
  }

  dataReceived() {
    this.emit('dataReceived');
    this.stop();
    this.start();
  }

  onTimeout() {
    this.emit('timeout');
  }
}
