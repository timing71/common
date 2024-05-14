import { EventEmitter } from '../../eventEmitter.js';

export class RMonitorClient extends EventEmitter {
  constructor() {
    super();

    this.clear = this.clear.bind(this);
    this.handleMessages = this.handleMessages.bind(this);
    this.handleMessage = this.handleMessage.bind(this);

    this.clear();
  }

  clear() {
    this.state = {
      classes: {},
      competitors: {},
      session: {},
      settings: {}
    };
  }

  handlers = {
    // Competitor information 1
    'A': (regNumber, number, transponder, firstName, lastName, nationality, classNumber) => {
      this.state.competitors[regNumber] = {
        ...this.state.competitors[regNumber] || {},
        regNumber,
        number,
        transponder,
        firstName,
        lastName,
        nationality,
        classNumber
      };
    },
    // Competitor information 2
    'COMP': (regNumber, number, classNumber, firstName, lastName, nationality, additional) => {
      this.state.competitors[regNumber] = {
        ...this.state.competitors[regNumber] || {},
        number,
        firstName,
        lastName,
        nationality,
        classNumber,
        additional
      };
    },
    // Run/session information
    'B': (number, description) => {
      this.state.session = {
        ...this.state.session || {},
        number,
        description
      };
    },
    // Class information
    'C': (id, description) => {
      this.state.classes[id] = description;
    },
    // Track settings
    'E': (name, value) => {
      this.state.settings[name] = value;
    },
    // Heartbeat
    'F': (lapsRemain, timeRemain, timestamp, timeElapsed, flagState) => {
      this.state.session = {
        ...this.state.session || {},
        flagState,
        lapsRemain,
        timeElapsed,
        timeRemain,
        timestamp
      };
    },
    // Race information
    'G': (position, regNumber, laps, totalTime) => {
      this.state.competitors[regNumber] = {
        ...this.state.competitors[regNumber] || {},
        position,
        laps,
        totalTime
      };
    },
    // Practice/Qualifying information
    'H': (bestPosition, regNumber, bestLapNum, bestLapTime) => {
      this.state.competitors[regNumber] = {
        ...this.state.competitors[regNumber] || {},
        bestPosition,
        bestLapNum,
        bestLapTime
      };
    },
    // Clear
    'I': () => {
      this.clear();
    },
    // Start/finish crossing information
    'J': (regNumber, laptime, totalTime) => {
      this.state.competitors[regNumber] = {
        ...this.state.competitors[regNumber] || {},
        lastLapTime: laptime,
        totalTime
      };
    },
    // Race Monitor: s/f crossing
    'RMHL': (regNumber, laps, position, lastLapTime, lastFlag, totalTime) => {
      this.state.competitors[regNumber] = {
        ...this.state.competitors[regNumber] || {},
        laps,
        lastFlag,
        lastLapTime,
        position,
        totalTime
      };
    },
    // Race Monitor: transponder last seen
    'RMLT': (regNumber, timestamp) => {
      this.state.competitors[regNumber] = {
        ...this.state.competitors[regNumber] || {},
        lastSeen: timestamp
      };
    }
  };

  handleMessages(messages) {
    messages.split('\r\n').forEach(
      this.handleMessage
    );
    return this.state;
  }

  handleMessage(message) {
    if (message.startsWith('$')) {
      const [msgType, ...args] = message.trim().slice(1).split(',');

      if (this.handlers[msgType]) {
        this.handlers[msgType](...args.map(a => a.replaceAll('"', '').trim()));
        this.emit('update', { ...this.state });
      }
      else {
        console.log('Unknown: ', msgType, args);
      }
      return this.state;
    }
  }
}
