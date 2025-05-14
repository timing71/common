import { MessageGenerator } from '../index.js';
import { Stat } from '../../racing.js';

it('generates car message on pit in', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has entered the pits');
});

it('generates car message on pit out', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'PIT', 'LMP1', 'Eve Hewitt'], ['3', 'FUEL', 'LMP2', 'Joe Bradley']];
  const newCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt'], ['3', 'RUN', 'LMP2', 'Joe Bradley']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(3);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits');
  expect(msgs[1][2]).toEqual('#2 (Eve Hewitt) has left the pits');
  expect(msgs[2][2]).toEqual('#3 (Joe Bradley) has left the pits');
});

it('handles driver rankings being specified', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', ['John Hindhaugh', 'bronze']], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'PIT', 'LMP1', ['John Hindhaugh', 'bronze']], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has entered the pits');
});
