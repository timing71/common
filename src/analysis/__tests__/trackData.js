import { TrackData } from '../trackData.js';

describe('Track data', () => {
  it('records changes in track data', () => {
    const trackData = TrackData.create();

    const oldState = {
      lastUpdated: 1000,
      manifest: {
        trackDataSpec: ['Value A', 'Value B']
      },
      session: {
        trackData: [
          [123, 'units'],
          [576, '°C']
        ]
      }
    };

    const newState = {
      lastUpdated: 1234,
      manifest: {
        trackDataSpec: ['Value A', 'Value B']
      },
      session: {
        trackData: [
          [456, 'units'],
          [576, '°C']
        ]
      }
    };

    trackData.update(oldState, newState);

    expect(trackData.series.size).toEqual(2);
    const valA = trackData.series.get('Value A');
    expect(valA.data.length).toEqual(2);
    expect(valA.data[1].timestamp).toEqual(new Date(1234));
    expect(valA.data[1].value).toEqual(456);

    expect(trackData.series.get('Value B').data.length).toEqual(1);

    const nextState = {
      lastUpdated: 5678,
      manifest: {
        trackDataSpec: ['Value A', 'Value B']
      },
      session: {
        trackData: [
          [1024, 'units'],
          [576, '°C']
        ]
      }
    };

    trackData.update(newState, nextState);
    expect(trackData.series.get('Value A').data.length).toEqual(3);
  });

  it('Ignores values not given as [value, unit] pairs', () => {
    const trackData = TrackData.create();

    const oldState = {
      lastUpdated: 1000,
      manifest: {
        trackDataSpec: ['Value A', 'Value B']
      },
      session: {
        trackData: [
          [123, 'units'],
          '576 °C'
        ]
      }
    };

    trackData.update(oldState, oldState);

    expect(trackData.series.get('Value B')).toEqual(undefined);
  });
});
