import { timeInSeconds } from '../formats.js';
import { Stat } from '../racing.js';
import { Message } from './Message.js';

export const PitMessage = (se, oldCar, newCar, cache) => {
  const oldState = se.get(oldCar, Stat.STATE);
  const newState = se.get(newCar, Stat.STATE);
  const carNum = se.get(newCar, Stat.NUM);

  if (!cache['PitMessage']) {
    cache['PitMessage'] = {};
  }

  if (!cache['PitMessage'][carNum]) {
    cache['PitMessage'][carNum] = {};
  }

  if (oldState !== newState && !!carNum && oldState !== 'N/S') {
    const driver = se.getDriverName(newCar);
    const clazz = se.get(newCar, Stat.CLASS, 'Pits');

    const driverText = driver ? ` (${driver})` : '';

    if ((oldState !== 'RUN' && oldState !== 'STOP' && newState === 'OUT') || ((oldState === 'PIT' || oldState === 'FUEL') && newState === 'RUN')) {
      const lastPitIn = cache['PitMessage'][carNum].lastPitIn;
      let pitTimeMsg = '';
      if (Number.isInteger(lastPitIn)) {
        const pitTime = cache.lastUpdated - lastPitIn;
        pitTimeMsg = `(pit time: ${timeInSeconds(pitTime, 0)})`;
        delete cache['PitMessage'][carNum].lastPitIn;
      }
      return new Message(clazz, `#${carNum}${driverText} has left the pits ${pitTimeMsg}`.trim(), 'out', carNum);
    }
    else if (newState === 'PIT') {
      if (oldState !== 'FUEL') {
        cache['PitMessage'][carNum].lastPitIn = cache.lastUpdated;
      }
      return new Message(clazz, `#${carNum}${driverText} has entered the pits`, 'pit', carNum);
    }
    else if (newState === 'FUEL' && oldState !== 'PIT') {
      cache['PitMessage'][carNum].lastPitIn = cache.lastUpdated;
    }
  }
};
