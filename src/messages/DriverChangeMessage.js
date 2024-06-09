import { Stat } from '../racing.js';
import { Message } from './Message.js';

export const DriverChangeMessage = (se, oldCar, newCar) => {
  const oldDriver = se.get(oldCar, Stat.DRIVER);
  const newDriver = se.get(newCar, Stat.DRIVER);
  const carNum = se.get(newCar, Stat.NUM);
  const clazz = se.get(newCar, Stat.CLASS, 'Pits');

  const oldDriverName = Array.isArray(oldDriver) ? oldDriver[0] : oldDriver;
  const newDriverName = Array.isArray(newDriver) ? newDriver[0] : newDriver;

  if (!!carNum && oldDriverName !== newDriverName) {
    let message = '';
    if (!oldDriver) {
      message = `#${carNum} Driver change (to ${newDriverName})`;
    }
    else if (!newDriver) {
      message = `#${carNum} Driver change (${oldDriverName} to nobody)`;
    }
    else {
      message = `#${carNum} Driver change (${oldDriverName} to ${newDriverName})`;
    }

    return new Message(
      clazz,
      message,
      null,
      carNum
    );
  }
};
