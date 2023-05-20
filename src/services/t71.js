import { Events } from './events.js';
import { Service } from './services.js';

export class T71 extends Service {
  start(connectionService) {
    const match = this.service.source.match(T71.regex);
    const ws = connectionService.createWebsocket(`ws://${match.groups.host}:${match.groups.port | 24771}`);

    ws.on('message', (msg) => {
      const data = msg.data ? JSON.parse(msg.data) : JSON.parse(msg.toString());

      switch (data.type) {
        case 'MANIFEST_UPDATE':
          this.emit(Events.MANIFEST_CHANGE, data.manifest);
          break;
        case 'STATE_UPDATE':
          this.emit(Events.STATE_CHANGE, data.state);
          break;
        case 'ANALYSIS_STATE':
          this.emit(Events.ANALYSIS_STATE, data.data);
          break;
      }
    });
  }
};

T71.regex = /^t71:\/\/(?<host>[^:/]+)(:(?<port>[0-9]+))?/;
