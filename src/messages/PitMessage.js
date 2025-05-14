import dayjs from '../dates.js';
import { Stat } from '../racing.js';
import { Message } from './Message.js';

const roundToSecond = (ts) => Math.round(ts / 1000) * 1000;

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

    if (oldState !== 'FUEL' && newState === 'FUEL') {
      cache['PitMessage'][carNum].lastFuelIn = cache.lastUpdated;
    }

    if (oldState === 'FUEL' && newState !== 'FUEL') {
      cache['PitMessage'][carNum].lastFuelOut = cache.lastUpdated;
    }

    if (oldState !== 'PIT' && newState === 'PIT') {
      cache['PitMessage'][carNum].lastPitIn = cache.lastUpdated;
    }

    if (oldState === 'PIT' && newState !== 'PIT') {
      cache['PitMessage'][carNum].lastPitOut = cache.lastUpdated;
    }

    if ((oldState !== 'RUN' && oldState !== 'STOP' && newState === 'OUT') || ((oldState === 'PIT' || oldState === 'FUEL') && newState === 'RUN')) {
      const { lastFuelIn, lastFuelOut, lastPitIn, lastPitOut } = cache['PitMessage'][carNum];
      let pitTimeMsg = '';
      if (Number.isInteger(lastPitIn) && Number.isInteger(lastPitOut)) {
        const pitTime = roundToSecond(lastPitOut) - roundToSecond(lastPitIn);

        const fuelTime = roundToSecond(lastFuelOut || 0) - roundToSecond(lastFuelIn || 0);
        if (fuelTime > 0) {
          pitTimeMsg = `(total pit time: ${dayjs.duration(pitTime + fuelTime).format('m:ss')}, ${dayjs.duration(fuelTime).format('m:ss')} fuel)`;
        }
        else {
          pitTimeMsg = `(pit time: ${dayjs.duration(pitTime).format('m:ss')})`;
        }

        delete cache['PitMessage'][carNum];
      }
      return new Message(clazz, `#${carNum}${driverText} has left the pits ${pitTimeMsg}`.trim(), 'out', carNum);
    }
    else if (newState === 'PIT') {
      return new Message(clazz, `#${carNum}${driverText} has entered the pits`, 'pit', carNum);
    }
  }
};
