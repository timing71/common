// These types are a work-in-progress and should not be considered normative.

type StatType = [string, string, string?];

export const Stat: Record<string, StatType>;

export type ColumnSpec = StatType[];

interface ServiceDefinition {
  uuid: string,
  source: string,
  startTime: number
}

type Value = string | number | null;
type ValueFlag = string;
type FlaggedValue = [Value, ValueFlag];

type Car = (Value | FlaggedValue)[];

interface SessionState {
  timeElapsed?: number,
  timeRemain?: number,
  flagState: string,
  lapsRemain?: number,
  trackData?: (Value | FlaggedValue)[]
}

type Message = [number, string, string, string?, string?];

interface Manifest {
  uuid: string,
  name: string,
  description: string,
  colSpec: ColumnSpec,
  trackDataSpec?: string[]
}

interface ServiceState {
  cars: Car[],
  session: SessionState,
  manifest: Manifest,
  messages: Message[],
}

interface CreateWebsocketOptions {
  tag?: string,
  autoReconnect?: boolean
}

interface ConnectionService {
  fetch(url: string, options: Record<string, any>): Promise<string | [string, Record<string, string>]>;
  createWebsocket(url: string, options: CreateWebsocketOptions): any;
}

export class Service {
  constructor(service: ServiceDefinition, initialState?: ServiceState);

  onStateChange(state: Partial<SessionState>): void;
  onManifestChange(manifest: Partial<Manifest>): void;
  onSessionChange(): void;

  start(connectionService: ConnectionService): void;
  stop(): void;
}
