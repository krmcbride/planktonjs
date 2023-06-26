import { EventEmitter } from 'eventemitter3';
import type { TypedEventEmitter } from './typed-event-emitter';

export { TypedEventEmitter } from './typed-event-emitter';

export type PlanktonEvents = {
  started: () => void;
  shutdown: (shutdownPromises: Promise<unknown>[]) => void;
};

// eslint-disable-next-line import/prefer-default-export
export const emitter = new EventEmitter() as TypedEventEmitter<PlanktonEvents>;
