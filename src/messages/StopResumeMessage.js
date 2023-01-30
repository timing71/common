import { Stat } from '../racing.js';
import { Message } from './Message.js';

export const StopResumeMessage = (se, oldCar, newCar) => {
  const oldState = se.get(oldCar, Stat.STATE);
  const newState = se.get(newCar, Stat.STATE);
  const carNum = se.get(newCar, Stat.NUM);

  if (oldState !== newState && !!carNum) {
    const driver = se.get(newCar, Stat.DRIVER);
    const clazz = se.get(newCar, Stat.CLASS, 'Pits');

    const driverText = driver ? ` (${driver})` : '';

    if (newState === 'STOP') {
      return new Message(clazz, `#${carNum}${driverText} is running slowly or stopped`);
    }
    else if (oldState === 'STOP' && (newState === 'RUN' || newState === 'OUT')) {
      return new Message(clazz, `#${carNum}${driverText} has resumed`);
    }
  }
};
