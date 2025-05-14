import { MessageGenerator } from '../index.js';
import { Stat } from '../../racing.js';

const colSpec = [Stat.NUM, Stat.STATE, Stat.CLASS, Stat.DRIVER];

it('generates car message on pit in', () => {
  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has entered the pits');
});

it('generates car message on pit out', () => {
  const oldCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'PIT', 'LMP1', 'Eve Hewitt'], ['3', 'FUEL', 'LMP2', 'Joe Bradley']];
  const newCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt'], ['3', 'RUN', 'LMP2', 'Joe Bradley']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(3);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits');
  expect(msgs[1][2]).toEqual('#2 (Eve Hewitt) has left the pits');
  expect(msgs[2][2]).toEqual('#3 (Joe Bradley) has left the pits');
});

it('handles driver rankings being specified', () => {
  const oldCars = [['1', 'RUN', 'LMP1', ['John Hindhaugh', 'bronze']], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const newCars = [['1', 'PIT', 'LMP1', ['John Hindhaugh', 'bronze']], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const msgs = new MessageGenerator().generate({ colSpec }, { cars: oldCars }, { cars: newCars });

  expect(msgs.length).toEqual(1);
  expect(msgs[0][2]).toEqual('#1 (John Hindhaugh) has entered the pits');
});

it('calculates a total pit time if both pit-in and pit-out have been seen', () => {
  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitInCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitOutCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const generator = new MessageGenerator();

  generator.generate({ colSpec }, { cars: oldCars, lastUpdated: 0 }, { cars: pitInCars, lastUpdated: 0 });
  const outMsgs = generator.generate({ colSpec }, { cars: pitInCars, lastUpdated: 0 }, { cars: pitOutCars, lastUpdated: 123000 });

  expect(outMsgs.length).toEqual(1);
  expect(outMsgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits (pit time: 2:03)');
});

it('calculates a total pit time if both pit-in and pit-out have been seen and car goes out via fuelling area', () => {
  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitInCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitFuelCars = [['1', 'FUEL', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitOutCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const generator = new MessageGenerator();

  generator.generate({ colSpec }, { cars: oldCars, lastUpdated: 0 }, { cars: pitInCars, lastUpdated: 0 });
  generator.generate({ colSpec }, { cars: pitInCars, lastUpdated: 0 }, { cars: pitFuelCars, lastUpdated: 62000 });
  const outMsgs = generator.generate({ colSpec }, { cars: pitFuelCars, lastUpdated: 62000 }, { cars: pitOutCars, lastUpdated: 123000 });

  expect(outMsgs.length).toEqual(1);
  expect(outMsgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits (total pit time: 2:03, 1:01 fuel)');
});

it('calculates total pit time and fuel time if both pit-in and pit-out have been seen and car comes in via fuelling area', () => {
  const oldCars = [['1', 'RUN', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitInCars = [['1', 'PIT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitFuelCars = [['1', 'FUEL', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];
  const pitOutCars = [['1', 'OUT', 'LMP1', 'John Hindhaugh'], ['2', 'RUN', 'LMP1', 'Eve Hewitt']];

  const generator = new MessageGenerator();

  generator.generate({ colSpec }, { cars: oldCars, lastUpdated: 0 }, { cars: pitFuelCars, lastUpdated: 0 });
  generator.generate({ colSpec }, { cars: pitFuelCars, lastUpdated: 0 }, { cars: pitInCars, lastUpdated: 52499 });
  // Also demonstrating rounding to the nearest second
  const outMsgs = generator.generate({ colSpec }, { cars: pitInCars, lastUpdated: 52499 }, { cars: pitOutCars, lastUpdated: 123499 });

  expect(outMsgs.length).toEqual(1);
  expect(outMsgs[0][2]).toEqual('#1 (John Hindhaugh) has left the pits (total pit time: 2:03, 0:52 fuel)');
});
