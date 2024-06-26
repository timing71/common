import { Stat } from '../racing.js';
import { Message } from './Message.js';

export const DriverChangeMessage = (se, oldCar, newCar) => {
  const oldDriver = se.getDriverName(oldCar);
  const newDriver = se.getDriverName(newCar);
  const carNum = se.get(newCar, Stat.NUM);
  const clazz = se.get(newCar, Stat.CLASS, 'Pits');

  if (!!carNum && oldDriver !== newDriver) {
    let message = '';
    if (!oldDriver) {
      message = `#${carNum} Driver change (to ${newDriver})`;
    }
    else if (!newDriver) {
      message = `#${carNum} Driver change (${oldDriver} to nobody)`;
    }
    else {
      message = `#${carNum} Driver change (${oldDriver} to ${newDriver})`;
    }

    return new Message(
      clazz,
      message,
      null,
      carNum
    );
  }
};
