import { MessageGenerator } from '../index.js';
import { Stat } from '../../racing.js';

it('generates car message on change to STOP', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'STOP', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) is running slowly or stopped');
});

it('generates car message on change from STOP', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'STOP', 'LMP1', 'John Hindhaugh'], ['2', 'STOP', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'OUT', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(2);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has resumed');
  expect(msgs[1][2]).toEqual('#2 (Eve Hewitt) has resumed');
});
