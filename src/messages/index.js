import { Stat } from '../racing.js';
import { StatExtractor } from '../statExtractor.js';
import { DriverChangeMessage } from './DriverChangeMessage.js';
import { FastLapMessage } from './FastLapMessage.js';
import { FlagMessage } from './FlagMessage.js';
import { FuelMessage } from './FuelMessage.js';
import { PitMessage } from './PitMessage.js';
import { StopResumeMessage } from './StopResumeMessage.js';

export { Message, RaceControlMessage } from './Message.js';

const GLOBAL_GENERATORS = [
  FlagMessage
];

const PER_CAR_GENERATORS = [ // Order can be significant (e.g. driver change before pit out!)
  FastLapMessage,
  PitMessage,
  FuelMessage,
  DriverChangeMessage,
  StopResumeMessage
];

export class MessageGenerator {
  constructor(opts = {}) {
    const { global = [], perCar = [] } = opts;
    this._state = {};
    this._global = [...GLOBAL_GENERATORS, ...global];
    this._perCar = [...PER_CAR_GENERATORS, ...perCar];

    this.generate = this.generate.bind(this);
  }

  generate(manifest, oldState, newState) {
    if (!newState || !oldState) {
      return [];
    }
    const globalMessages = this._global.flatMap(
      generator => {
        const maybeMessages = generator(manifest, oldState, newState, this._state);
        if (Array.isArray(maybeMessages)) {
          return maybeMessages.map(m => m.toCTDFormat());
        }
        else if (maybeMessages?.toCTDFormat) {
          return [maybeMessages.toCTDFormat()];
        }
        return [];
      }
    );

    const perCarMessages = [];

    if (manifest?.colSpec?.find(s => s[0] === Stat.NUM[0])) { // Can't use includes() any more FSR...
      const se = new StatExtractor(manifest.colSpec);
      (newState.cars || []).forEach(
        newCar => {
          const oldCar = se.findCarInList(newCar, oldState.cars);
          if (oldCar) {
            this._perCar.forEach(
              generator => {
                const possibleMessage = generator(se, oldCar, newCar, this._state);
                if (possibleMessage) {
                  perCarMessages.push(possibleMessage.toCTDFormat());
                }
              }
            );
          }
        }
      );
    }

    return globalMessages.concat(perCarMessages);
  }
}
