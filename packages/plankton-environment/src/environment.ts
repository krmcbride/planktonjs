import assert from 'assert';
import { isBoolean, isString } from 'lodash';
import { Secret, wrap } from './kms';

const isTruthular = (value?: string): boolean => {
  if (value === undefined) {
    return false;
  }
  switch (value.toLowerCase()) {
    case 'false':
    case 'off':
    case 'no':
    case 'nope':
    case '0':
      return false;
    default:
      return true;
  }
};

const resolveName = (name: string): string => {
  if (name in process.env) {
    return name;
  }
  const usName = name.replace(/\./g, '_');
  if (usName in process.env) {
    return usName;
  }
  const ucName = name.toUpperCase();
  if (ucName in process.env) {
    return ucName;
  }
  const ucUsName = ucName.replace(/\./g, '_');
  if (ucUsName in process.env) {
    return ucUsName;
  }
  return name;
};

const fromEnv = (key: string) => process.env[resolveName(key)];

export const getProperty = (key: string, defVal?: string): string => {
  const value = fromEnv(key);
  if (value === undefined) {
    assert(defVal !== undefined, `Property ${key} not found and no default value given`);
    return defVal;
  }
  // Sanity check
  assert(isString(value), `Property ${key} has non-string value ${value}`);
  return value;
};

export const getPropertyAsBoolean = (key: string, defVal?: boolean | string): boolean => {
  const value = fromEnv(key);
  if (value === undefined || value === 'undefined' || value === 'null') {
    if (defVal === undefined) {
      return false;
    }
    if (isBoolean(defVal)) {
      return defVal;
    }
    return isTruthular(defVal);
  }
  // Sanity check
  assert(isString(value), `Property ${key} has non-string value ${value}`);
  return isTruthular(value);
};

export const getPropertyAsObject = <T>(key: string, defVal?: T): T => {
  const value = fromEnv(key);
  if (value === undefined) {
    assert(defVal !== undefined, `Property ${key} not found and no default value given`);
    return defVal;
  }
  // Sanity check
  assert(isString(value), `Property ${key} has non-string value ${value}`);
  return JSON.parse(value);
};

export const getPropertyAsSecret = (
  key: string,
  defVal?: string,
  passthrough?: boolean,
): Secret => {
  const value = fromEnv(key);
  if (value === undefined) {
    assert(defVal !== undefined, `Property ${key} not found and no default value given`);
    return { decrypt: () => Promise.resolve(defVal) };
  }
  // Sanity check
  assert(isString(value), `Property ${key} has non-string value ${value}`);
  return wrap(
    value,
    passthrough === undefined
      ? process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
      : passthrough,
  );
};
