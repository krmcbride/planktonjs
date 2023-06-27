export type Deferred<T> = {
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  promise: Promise<T>;
};

export const defer = <T>() => {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((...args) => {
    [resolve, reject] = args;
  });
  // We return this as a promise to ensure this promise executor callback executes
  // after the last one does
  return new Promise<Deferred<T>>((r) => {
    r({
      resolve,
      reject,
      promise,
    });
  });
};

