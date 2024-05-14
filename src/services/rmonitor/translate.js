import dayjs from '../../dates.js';
import { Stat } from '../../racing.js';

export const getManifest = (state) => {
  const descParts = (state.session.description || '').split(' - ');

  const name = descParts.length === 1 ? 'RMonitor' : descParts[0];
  const description = descParts.length === 1 ? descParts : descParts[1];

  return {
    name,
    description,
    colSpec: [
      Stat.NUM,
      Stat.DRIVER,
      Stat.LAPS,
      Stat.LAST_LAP,
      Stat.BEST_LAP
    ]
  };
};

export const getState = (state) => {
  return {
    cars: mapCars(Object.values(state.competitors)),
    session: {}
  };
};

const mapCars = (competitors) => {
  const sortedCompetitors = competitors.sort(
    (a, b) => {
      const positionDiff = parseInt(a.position || 0, 10) - parseInt(b.position || 0, 10);
      if (positionDiff === 0) {
        return (b.lastSeen || 0) - (a.lastSeen || 0);
      }
      return positionDiff;
    }
  );

  return sortedCompetitors.map(
    car => {
      const lastLap = parseTime(car.lastLapTime);
      const bestLap = parseTime(car.bestLapTime);
      return [
        car.number,
        `${car.lastName.toUpperCase()}, ${car.firstName}`,
        car.laps,
        lastLap > 0 ? lastLap : null,
        bestLap > 0 ? bestLap : null,
        car.regNumber,
        car.position
      ];
    }
  );
};

const parseTime = (time) => {
  if (!time) {
    return null;
  }
  const parsed = dayjs(time, 'HH:mm:ss.SSS').toObject();
  const duration = dayjs.duration({ hours: parsed.hours, minutes: parsed.minutes, seconds: parsed.seconds, milliseconds: parsed.milliseconds });
  return duration.asSeconds();
};
