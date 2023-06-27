export default async (func: (str: string) => void): Promise<void> => {
  await func('this is test module 1');
};
