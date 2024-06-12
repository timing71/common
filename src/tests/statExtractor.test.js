import { Stat } from '../racing.js';
import { StatExtractor } from '../statExtractor.js';

describe('StatExtractor', () => {
  it('extracts driver names correctly', () => {
    const colspec = [Stat.NUM, Stat.DRIVER];

    const se = new StatExtractor(colspec);

    expect(se.getDriverName([42, 'Eve Hewitt'])).toEqual('Eve Hewitt');
    expect(se.getDriverName([42, ['Eve Hewitt', 'platinum']])).toEqual('Eve Hewitt');
    expect(se.getDriverName([42, ['Eve Hewitt', null]])).toEqual('Eve Hewitt');
    expect(se.getDriverName([42, null])).toEqual(null);
  });

  it('extracts driver rankings when present', () => {
    const colspec = [Stat.NUM, Stat.DRIVER];

    const se = new StatExtractor(colspec);

    expect(se.getDriverRanking([42, 'Eve Hewitt'])).toEqual(null);
    expect(se.getDriverRanking([42, ['Eve Hewitt', 'platinum']])).toEqual('platinum');
    expect(se.getDriverRanking([42, ['Eve Hewitt', null]])).toEqual(null);
    expect(se.getDriverRanking([42, null])).toEqual(null);
  });
});
