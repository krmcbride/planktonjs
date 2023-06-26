import { getProperty, getPropertyAsBoolean, getPropertyAsObject } from '.';

// Note that even though we set non-strings we always get strings back from the process.env getter
const envVars = {
  'prop.source.test.1': 'hello',
  prop_source_test_2: 'world',
  'PROP.SOURCE.TEST.3': 123,
  PROP_SOURCE_TEST_4: false,
  hello: 'world',
  empty: '',
  aNumber: 123,
  enabled: true,
  disabled: false,
  'boolean-true': 'true',
  'boolean-false': 'false',
  'boolean-on': 'on',
  'boolean-off': 'off',
  'boolean-yes': 'yes',
  'boolean-no': 'no',
  'boolean-1': '1',
  'boolean-0': '0',
  'boolean-undefined': undefined,
  'boolean-null': null,
  jsonObject: '{"foo":123}',
  jsonArray: '[10, 20, 30]',
};

describe('support/environment', () => {
  beforeEach(() => {
    Object.entries(envVars).forEach(([key, value]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      process.env[key] = value;
    });
  });
  afterEach(() => {
    Object.entries(envVars).forEach(([key]) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete process.env[key];
    });
  });
  describe('getProperty', () => {
    it('searches system environment variables that match the property exactly', () => {
      expect(getProperty('prop.source.test.1')).toBe('hello');
    });
    it("searches system environment variables for the property with '.' replaced with '_'", () => {
      expect(getProperty('prop_source_test_2')).toBe('world');
    });
    it('searches system environment variables for the uppercased property', () => {
      expect(getProperty('PROP.SOURCE.TEST.3')).toBe('123');
    });
    it("searches system environment variables for the property uppercased and '.' replaced with '_'", () => {
      expect(getProperty('PROP_SOURCE_TEST_4')).toBe('false');
    });
  });
  describe('getPropertyAsBoolean', () => {
    it('returns property values as booleans', () => {
      expect(getPropertyAsBoolean('enabled')).toBe(true);
      expect(getPropertyAsBoolean('disabled')).toBe(false);
    });

    it('returns boolean false if the name is not defined and no default value is given', () => {
      expect(getPropertyAsBoolean('not.a.key')).toBe(false);
    });
    it('returns the default value as a boolean, if given, if the name is not defined', () => {
      expect(getPropertyAsBoolean('not.a.key', false)).toBe(false);
      expect(getPropertyAsBoolean('not.a.key', true)).toBe(true);
    });

    ['false', 'off', 'no', '0'].forEach((value) => {
      it(`interprets the string "${value}" as boolean false`, () => {
        expect(getPropertyAsBoolean(`boolean-${value}`)).toBe(false);
      });
    });
    [undefined, null].forEach((value) => {
      it(`interprets ${value} as boolean false`, () => {
        expect(getPropertyAsBoolean(`boolean-${value}`)).toBe(false);
      });
    });
    ['true', 'on', 'yes', '1'].forEach((value) => {
      it(`interprets the string "${value}" as boolean true`, () => {
        expect(getPropertyAsBoolean(`boolean-${value}`)).toBe(true);
        expect(getPropertyAsBoolean('not.a.key', value)).toBe(true);
      });
    });
    it('interprets everything else as boolean true', () => {
      expect(getPropertyAsBoolean('hello')).toBe(true);
      expect(getPropertyAsBoolean('aNumber')).toBe(true);
    });
    it('interprets an empty string as boolean true', () => {
      expect(getPropertyAsBoolean('empty')).toBe(true);
    });
  });
  describe('getPropertyAsObject', () => {
    it('returns property values as objects', () => {
      expect(getPropertyAsObject('jsonObject')).toEqual({ foo: 123 });
    });
    it('deserializes arrays', () => {
      expect(getPropertyAsObject('jsonArray')).toEqual([10, 20, 30]);
    });
    it('returns the default value as an object, if given, if the name is not defined', () => {
      expect(getPropertyAsObject('not.a.key', { bar: 456 })).toEqual({ bar: 456 });
    });
  });
});
