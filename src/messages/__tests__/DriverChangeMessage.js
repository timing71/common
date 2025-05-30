import { MessageGenerator } from '../index.js';
import { Stat } from '../../racing.js';

it('generates car message on driver change', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'RUN', 'LMP1', 'Jonny Palmer'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 Driver change (John Hindhaugh to Jonny Palmer)');
});

it('generates car message on driver change to nobody', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'RUN', 'LMP1', ''], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 Driver change (John Hindhaugh to nobody)');
});

it('generates car message on driver change from nobody', () => {
  const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

  const oldCars = [['1', 'RUN', 'LMP1', ''], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'RUN', 'LMP1', 'Jonny Palmer'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 Driver change (to Jonny Palmer)');
});
