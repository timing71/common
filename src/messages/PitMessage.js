import { Stat } from '../racing.js';
import { Message } from './Message.js';

export const PitMessage = (se, oldCar, newCar) => {
  const oldState = se.get(oldCar, Stat.STATE);
  const newState = se.get(newCar, Stat.STATE);
  const carNum = se.get(newCar, Stat.NUM);

  if (oldState !== newState && !!carNum && oldState !== 'N/S') {
    const driver = se.getDriverName(newCar);
    const clazz = se.get(newCar, Stat.CLASS, 'Pits');

    const driverText = driver ? ` (${driver})` : '';

    if ((oldState !== 'RUN' && oldState !== 'STOP' && newState === 'OUT') || ((oldState === 'PIT' || oldState === 'FUEL') && newState === 'RUN')) {
      return new Message(clazz, `#${carNum}${driverText} has left the pits`, 'out', carNum);
    }
    else if (newState === 'PIT') {
      return new Message(clazz, `#${carNum}${driverText} has entered the pits`, 'pit', carNum);
    }
  }
};
