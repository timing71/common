import { Stat } from '../racing.js';
import { Message } from './Message.js';

export const FuelMessage = (se, oldCar, newCar) => {
  // Creventic have a separate fuelling area than the pit lane
  const oldState = se.get(oldCar, Stat.STATE);
  const newState = se.get(newCar, Stat.STATE);
  const carNum = se.get(newCar, Stat.NUM);

  if (oldState !== newState && !!carNum && oldState !== 'N/S') {
    const driver = se.getDriverName(newCar);
    const clazz = se.get(newCar, Stat.CLASS, 'Pits');

    const driverText = driver ? ` (${driver})` : '';

    if (newState === 'FUEL') {
      return new Message(clazz, `#${carNum}${driverText} has entered the fuelling area`, 'pit', carNum);
    }
  }
};
