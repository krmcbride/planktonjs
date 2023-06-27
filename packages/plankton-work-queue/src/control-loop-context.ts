export default interface ControlLoopContext {
  get(key: string): string | undefined;
  set(key: string, value: string): void;
}

export interface PersistentControlLoopContext extends ControlLoopContext {
  refresh(): Promise<void>;
  flush(): Promise<void>;
}
