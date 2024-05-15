import dayjs from '../../dates.js';
import { FlagState, Stat } from '../../racing.js';

export const getManifest = (state) => {
  const descParts = (state.session.description || '').split(' - ');

  const name = descParts.length === 1 ? 'RMonitor' : descParts[0];
  const description = descParts.length === 1 ? descParts[0] : descParts[1];

  return {
    name,
    description: description || '',
    colSpec: [
      Stat.NUM,
      Stat.CLASS,
      Stat.STATE,
      Stat.DRIVER,
      Stat.LAPS,
      Stat.GAP,
      Stat.INT,
      Stat.LAST_LAP,
      Stat.BEST_LAP
    ]
  };
};

const FLAG_STATE = {
  'Green': FlagState.GREEN,
  'Finish': FlagState.CHEQUERED,
  '': FlagState.NONE
};

export const getState = (state) => {
  const lapsRemain = parseInt(state.session.lapsRemain, 10);

  return {
    cars: mapCars(state),
    session: {
      flagState: FLAG_STATE[state.session.flagState] || FlagState.NONE,
      timeElapsed: parseTime(state.session.timeElapsed, 'HH:mm:ss'),
      timeRemain: parseTime(state.session.timeRemain, 'HH:mm:ss'),
      lapsRemain: lapsRemain < 9999 ? lapsRemain : undefined,
      pauseClocks: !state.session.flagState
    }
  };
};

const raceGap = (first, second) => {
  const firstLaps = parseInt(first.laps, 10);
  const secondLaps = parseInt(second.laps, 10);
  const firstTime = parseTime(first.totalTime);
  const secondTime = parseTime(second.totalTime);

  if (firstLaps === secondLaps) {
    return secondTime - firstTime;
  }

  if (firstLaps && secondLaps) {
    const lapsGap = firstLaps - secondLaps;
    return `${lapsGap} lap${lapsGap === 1 ? '' : 's'}`;
  }

  return '';
};

const bestGap = (first, second) => {
  if (!first.bestLapTime || !second.bestLapTime) {
    return '';
  }
  return parseTime(first.bestLapTime) - parseTime(second.bestLapTime);
};

const mapCars = ({ competitors, classes, settings }) => {
  const positionKey = settings.sortMethod === 'race' ? 'position' : 'bestPosition';
  const sortedCompetitors = Object.values(competitors).sort(
    (a, b) => {
      const positionDiff = parseInt(a[positionKey] || 0, 10) - parseInt(b[positionKey] || 0, 10);
      if (positionDiff === 0) {
        return (b.lastSeen || 0) - (a.lastSeen || 0);
      }
      return positionDiff;
    }
  );

  const gapFunc = settings.sortMethod === 'race' ? raceGap : bestGap;

  return sortedCompetitors.map(
    (car, idx) => {
      const name = [car.lastName.toUpperCase(), car.firstName].filter(n => !!n).join(', ');

      const clazz = classes[car.classNumber] || car.classNumber;

      const lastLap = parseTime(car.lastLapTime);
      const bestLap = parseTime(car.bestLapTime);

      const llFlag = (lastLap === bestLap) ? 'pb' : '';

      const gap = idx > 0 ? gapFunc(sortedCompetitors[0], car) : '';
      const interval = idx > 0 ? gapFunc(sortedCompetitors[idx - 1], car) : '';

      return [
        car.number,
        clazz,
        car.lastFlag === 'Finish' ? 'FIN' : 'RUN',
        name,
        car.laps,
        gap,
        interval,
        [lastLap > 0 ? lastLap : null, llFlag],
        [bestLap > 0 ? bestLap : null, 'old'],
        car.regNumber,
        car.position
      ];
    }
  );
};

const parseTime = (time, format = 'HH:mm:ss.SSS') => {
  if (!time) {
    return null;
  }
  const parsed = dayjs(time, format).toObject();
  const duration = dayjs.duration({ hours: parsed.hours, minutes: parsed.minutes, seconds: parsed.seconds, milliseconds: parsed.milliseconds });
  return duration.asSeconds();
};
