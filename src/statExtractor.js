import { Stat } from './racing.js';

/**
 * Utility class to extract a given {@link Stat} from a car's data given a
 * column spec.
 */
export class StatExtractor {
  /**
   * Create a new StatExtractor.
   * @param {Stat[]} columnSpec Column spec (list of Stats)
   */
  constructor(columnSpec = []) {
    this._colSpec = columnSpec;
    this._reverseMap = {};
    columnSpec.forEach(
      (stat, idx) => {
        this._reverseMap[stat] = idx;
      }
    );
    this.get = this.get.bind(this);
    this.findCarInList = this.findCarInList.bind(this);
  }

  /**
   * Retrieves a given {@link Stat} from the given car data.
   * @param {any[]} car
   * @param {Stat} stat
   * @param {any} defaultValue Default to return if stat is not present.
   * @returns {any} The given Stat for the given car, or the default value.
   */
  get(car, stat, defaultValue = null) {
    if (this._reverseMap[stat] !== undefined) {
      return car[this._reverseMap[stat]] || defaultValue;
    }
    return defaultValue;
  }

  getDriverName(car) {
    const driver = this.get(car, Stat.DRIVER);
    if (!driver) {
      return null;
    }
    return Array.isArray(driver) ? driver[0] : driver;
  }

  /**
   * Uses some unnecessarily complex logic to identify and retrieve a given
   * car from a list of cars.
   *
   * You'd have hoped that a race number alone would be sufficient to uniquely
   * identify a car in a given session, wouldn't you? Unfortunately, experience
   * has shown that timing providers are quite happy to have multiple cars on
   * track at once with the same race number.
   *
   * This method tries to match on all of race number, car type and class to
   * try and identify a unique match. If it can't identify a single matching
   * car, it will error to the console and return undefined; if it can, it
   * returns that matching car.
   *
   * @param {any[]} car
   * @param {any[][]} cars
   * @returns The identified car, or undefined.
   */
  findCarInList(car, cars = []) {
    // You'd have hoped that race number would be enough to uniquely
    // identify a car within a session, right? You'd be wrong...
    const wantedNum = this.get(car, Stat.NUM);
    const wantedCar = this.get(car, Stat.CAR);
    const wantedClass = this.get(car, Stat.CLASS);

    if (wantedNum !== undefined) {
      const possibleMatches = cars.filter(
        oldCar => (
          this.get(oldCar, Stat.NUM) === wantedNum &&
          this.get(oldCar, Stat.CAR) === wantedCar &&
          this.get(oldCar, Stat.CLASS) === wantedClass
        )
      );

      if (possibleMatches.length > 1) {
        console.warn(`Found ${possibleMatches.length} possible matches for car ${wantedNum}!`); // eslint-disable-line no-console
      }
      else if (possibleMatches.length === 1) {
        return possibleMatches[0];
      }
    }
  }
}
