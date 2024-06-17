import { BlobReader, TextWriter, ZipReader } from '@zip.js/zip.js';
import { diff, patch } from './diffs.js';

export const REPLAY_FRAME_REGEX = /^([0-9]{5,11})(i?).json$/;

export class Replay {
  constructor(zipFile) {
    this._file = zipFile;
    this._keyframes = {};
    this._iframes = {};

    this.forEachFrame = this.forEachFrame.bind(this);
  }

  async _init() {
    const entries = await this.listEntries();

    await Promise.all(
      entries.map(
        async entry => {
          const frameMatch = entry.filename.match(REPLAY_FRAME_REGEX);
          if (frameMatch) {
            const isIFrame = !!frameMatch[2];
            const timestamp = parseInt(frameMatch[1], 10);

            if (isIFrame) {
              this._iframes[timestamp] = entry;
            }
            else {
              this._keyframes[timestamp] = entry;
            }
            return Promise.resolve();
          }
          else if (entry.filename === 'manifest.json') {
            this.manifest = await this.readEntry(entry);
          }
        }
      )
    );

    if (!this.manifest) {
      throw new Error('No manifest found!');
    }
    if (this.manifest.version !== 1) {
      throw new Error(`Manifest version ${this.manifest.version} unsupported (expecting version 1)`);
    }

    const firstFrame = Math.min(
      Math.min(...Object.keys(this._keyframes)),
      Math.min(...Object.keys(this._iframes))
    );

    const lastFrame = Math.max(
      Math.max(...Object.keys(this._keyframes)),
      Math.max(...Object.keys(this._iframes))
    );

    this.manifest.duration = lastFrame - firstFrame;
    this.manifest.startTime = firstFrame;
  }

  async listEntries() {
    return await this._file.getEntries();
  }

  async readEntry(e) {
    const text = await e.getData(new TextWriter());
    return JSON.parse(text);
  }

  async getStateAt(time) {
    const closestKeyframe = Math.max(...Object.keys(this._keyframes).filter(k => (parseInt(k, 10) <= time)));

    if (this._keyframes[closestKeyframe]) {
      const keyframeState = await this.readEntry(this._keyframes[closestKeyframe]);

      const iframes = Object.keys(this._iframes).filter(
        i => {
          const iVal = parseInt(i, 10);
          return iVal > closestKeyframe && iVal <= time;
        }
      );

      let myState = { ...keyframeState };

      for (let i = 0; i < iframes.length; i++) {
        const ifrState = await this.readEntry(this._iframes[iframes[i]]);
        myState = await applyIframe(myState, ifrState);
      }

      if (!myState.manifest) {
        myState.manifest = this.manifest;
      }

      if (!myState.lastUpdated) {
        myState.lastUpdated = time;
      }

      return myState;
    }

    return {};
  }

  async getStateAtRelative(relTime) {
    return await this.getStateAt(this.manifest.startTime + relTime);
  }

  /**
   * Pass a function that will be called once for each frame in this recording,
   * in order.
   *
   * The returned timestamp is a Unix-style timestamp (without milliseconds).
   *
   * @param {function} callback Function that will get called with arguments
   *                   `(state, timestamp)` for each frame in the recording.
   */
  async forEachFrame(callback) {
    const keyframes = Object.keys(this._keyframes).map(k => parseInt(k, 10)).sort();
    const iframes = Object.keys(this._iframes).map(k => parseInt(k, 10)).sort();

    let prevFrame = null;
    while (keyframes.length > 0) {
      const k = keyframes.shift();

      const kf = await this.readEntry(this._keyframes[k]);

      prevFrame = kf;

      if (!prevFrame.manifest) {
        prevFrame.manifest = this.manifest;
      }

      if (!prevFrame.lastUpdated) {
        prevFrame.lastUpdated = k;
      }

      callback(kf, k);

      while (iframes.length > 0 && (keyframes.length === 0 || iframes[0] < keyframes[0])) {
        const i = iframes.shift();
        const ifr = await this.readEntry(this._iframes[i]);
        prevFrame = await applyIframe(prevFrame, ifr);
        // Internal lastUpdated is a JS timestamp (with milliseconds)
        prevFrame.lastUpdated = i * 1000;
        // Callback gets a Unix timestamp (no milliseconds)
        callback(prevFrame, i);
      }
    }
  }
}

const applyIframe = (base, iframe) => {
  return new Promise(
    (resolve) => {
      const result = {
        ...base,
        cars: patch(iframe['cars'], base['cars']),
        session: patch(iframe['session'], base['session']),
        messages: iframe['messages'].concat(base['messages']).slice(0, 100),
        highlight: iframe['highlight'] || []
      };
      resolve(result);
    }
  );
};

export const createIframe = (base, newState) => {
  const prevLatestMessage = base.messages[0];
  const messages = prevLatestMessage ? [] : newState.messages;

  if (prevLatestMessage) {
    for (let i = 0; i < newState.messages.length; i++) {
      const newMessage = newState.messages[i];
      if (
        newMessage[0] === prevLatestMessage[0] &&
        newMessage[1] === prevLatestMessage[1] &&
        newMessage[2] === prevLatestMessage[2]
      ) {
        break;
      }
      messages.push(newMessage);
    }
  }

  return {
    cars: diff(base.cars || [], newState.cars || []),
    session: diff(base.session || {}, newState.session || {}),
    highlight: newState.highlight || [],
    messages
  };
};

export const loadReplayFromFile = async(file) => {
  const reader = new ZipReader(new BlobReader(file));
  const replay = new Replay(reader);
  await replay._init();
  return replay;
};
