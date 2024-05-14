import { Service } from '../services.js';
import { RMonitorClient } from './client.js';
import { getManifest, getState } from './translate.js';

export class RaceMonitor extends Service {
  start(connectionService) {
    const { groups: { raceID } } = this.service.source.match(RaceMonitor.regex);

    connectionService.fetch(`https://api.race-monitor.com/Info/WebRaceList?raceID=${raceID}`).then(
      (wrlText) => {
        const wrl = JSON.parse(wrlText);

        const token = wrl.LiveTimingToken;
        const host = wrl.LiveTimingHost;
        const currentRace = wrl.CurrentRaces.find(r => r.ReceivingData);

        if (!currentRace) {
          this.emitError('Could not find an active session');
        }
        else {
          const wsUrl = `wss://${host}/instance/${currentRace.Instance}/${token}`;

          this.socket = connectionService.createWebsocket(wsUrl);

          const client = new RMonitorClient();

          this.socket.on('connect', () => {
            this.emitInfo('Connected to upstream timing source');
            this.socket.send(`$JOIN,${currentRace.Instance},${token}`);
          });

          this.socket.on('message', (msg) => {
            const data = msg.data || msg.toString;
            client.handleMessages(data);
          });

          client.on('update', (state) => {
            this._pendingState = state;
          });

          setInterval(
            () => {
              if (this._pendingState) {
                console.log(this._pendingState);

                const manifest = getManifest(this._pendingState);
                this.onManifestChange(manifest);

                const state = getState(this._pendingState);
                console.log(state);
                this.onStateChange(state);

                this._pendingState = null;
              }
            },
            1000
          );
        }
      }
    );
  }

  stop() {
    this.socket?.close();
    this._updateInterval && clearInterval(this._updateInterval);
  }
}

RaceMonitor.regex = /http(s?):\/\/(www\.)?race-monitor.com\/Live\/Race\/(?<raceID>[0-9]+)/;
