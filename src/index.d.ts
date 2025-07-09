// These types are a work-in-progress and should not be considered normative.

import { Dayjs } from 'dayjs';
import { Events } from './services/events.js'

type StatType = [string, string, string?];

export const Stat: Record<string, StatType>;

export type ColumnSpec = StatType[];

interface ServiceDefinition {
  uuid: string,
  source: string,
  startTime: number,
  currentSessionIndex?: number
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
  trackData?: (Value | FlaggedValue)[],
  pauseClocks?: boolean
}

type Message = [number, string, string, string?, string?];

interface Manifest {
  uuid: string,
  name: string,
  description: string,
  colSpec: ColumnSpec,
  trackDataSpec?: string[],
  sectorTimePrecision?: number,
  timePrecision?: number,
  intervalPrecision?: number
}

interface ServiceState {
  cars: Car[],
  session: SessionState,
  manifest?: Manifest,
  messages: Message[],
}

interface CreateWebsocketOptions {
  tag?: string,
  autoReconnect?: boolean,
  protocols?: string[]
}

interface ConnectionService {
  fetch(url: string, options: Record<string, any>): Promise<string | [string, Record<string, string>]>;
  createWebsocket(url: string, options: CreateWebsocketOptions): any;
  createDOMParser(): DOMParser;
}

export class EventEmitter {
  protected emit(event: string, data: any): void

  on(event: string, handler: (data: any) => void): void
}

type EventType = 'ANALYSIS_STATE' |
  'MANIFEST_CHANGE' |
  'STATE_CHANGE' |
  'SESSION_CHANGE' |
  'SYSTEM_MESSAGE' |
  'RETRACT_SYSTEM_MESSAGE';

export const Events: Record<EventType, string>;

export const FlagState = {
  NONE: 'none',
  GREEN: 'green',
  WHITE: 'white',
  CHEQUERED: 'chequered',
  YELLOW: 'yellow',
  FCY: 'fcy',
  CODE_60: 'code_60',
  VSC: 'vsc',
  SC: 'sc',
  CAUTION: 'caution',
  RED: 'red',
  SLOW_ZONE: 'slow_zone',
  CODE_60_ZONE: 'code_60_zone'
}

export class Service extends EventEmitter {
  constructor(service: ServiceDefinition, initialState?: ServiceState);

  protected onStateChange(state: Partial<SessionState>): void;
  protected onManifestChange(manifest: Partial<Manifest>): void;
  protected onSessionChange(): void;

  start(connectionService: ConnectionService): void;
  stop(): void;
}

export function mapServiceProvider(url: string): { new(spec: ServiceDefinition): Service } | null

export function timeInSeconds(time: number, precision: number): string;
export function timeWithHours(time: number): string;
export function dasherizeParts(...args: string[]): string;

export const dayjs: Dayjs;
