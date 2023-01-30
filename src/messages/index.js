import { Stat } from '../racing.js';
import { StatExtractor } from '../statExtractor.js';
import { DriverChangeMessage } from './DriverChangeMessage.js';
import { FastLapMessage } from './FastLapMessage.js';
import { FlagMessage } from './FlagMessage.js';
import { PitMessage } from './PitMessage.js';
import { StopResumeMessage } from './StopResumeMessage.js';

export { Message, RaceControlMessage } from './Message.js';

const GLOBAL_GENERATORS = [
  FlagMessage
];

const PER_CAR_GENERATORS = [ // Order can be significant (e.g. driver change before pit out!)
  FastLapMessage,
  PitMessage,
  DriverChangeMessage,
  StopResumeMessage
];

export const generateMessages = (manifest, oldState, newState) => {
  if (!newState || !oldState) {
    return [];
  }
  const globalMessages = GLOBAL_GENERATORS.flatMap(
    mg => {
      const maybeMessages = mg(manifest, oldState, newState);
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
          PER_CAR_GENERATORS.forEach(
            generator => {
              const possibleMessage = generator(se, oldCar, newCar);
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
};
