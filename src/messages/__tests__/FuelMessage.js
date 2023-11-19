import { generateMessages } from '../index.js';
import { Stat } from '../../racing.js';

it('generates car message on entering fuel area', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'PIT', 'LMP1', 'Eve Hewitt'], ['3', 'RUN', 'LMP2', 'Joe Bradley']];
  const newCars = [['1', 'FUEL', 'LMP1', 'John Hindhaugh'], ['2', 'FUEL', 'LMP1', 'Eve Hewitt'], ['3', 'RUN', 'LMP2', 'Joe Bradley']];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(2);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has entered the fuelling area');
  expect(msgs[1][2]).toEqual('#2 (Eve Hewitt) has entered the fuelling area');
});

it('generates pit-exit messages on leaving fuel area', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'FUEL', 'LMP1', 'John Hindhaugh'], ['2', 'FUEL', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = generateMessages({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(2);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits');
  expect(msgs[1][2]).toEqual('#2 (Eve Hewitt) has left the pits');
});
