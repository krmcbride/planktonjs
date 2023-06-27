import path from 'path';
import mockConfig from './config';
import * as utils from './utils';

const planktonBaseDir = path.join(__dirname, '../../..');
jest.mock('./config');

describe('support/utils', () => {
  beforeEach(() => {
    mockConfig.projectPath = '.';
    mockConfig.modulePath = 'packages/plankton-express/src';
  });
  describe('removeTrailingSlashes', () => {
    it('removes a trailing slash from the provided string', () => {
      expect(utils.removeTrailingSlashes('foo/')).toBe('foo');
    });
    it('removes all trailing slashes from the provided string', () => {
      expect(utils.removeTrailingSlashes('bar//')).toBe('bar');
      expect(utils.removeTrailingSlashes('baz//////')).toBe('baz');
    });
    it('does nothing if there are no trailing slashes', () => {
      expect(utils.removeTrailingSlashes('foo')).toBe('foo');
      expect(utils.removeTrailingSlashes('')).toBe('');
    });
  });
  describe('removeLeadingSlashes', () => {
    it('removes a trailing slash from the provided string', () => {
      expect(utils.removeLeadingSlashes('/foo')).toBe('foo');
    });
    it('removes all trailing slashes from the provided string', () => {
      expect(utils.removeLeadingSlashes('//bar')).toBe('bar');
      expect(utils.removeLeadingSlashes('///////baz')).toBe('baz');
    });
    it('does nothing if there are no trailing slashes', () => {
      expect(utils.removeLeadingSlashes('foo')).toBe('foo');
      expect(utils.removeLeadingSlashes('')).toBe('');
    });
  });
  describe('addLeadingSlash', () => {
    it('adds a leading slash to the provided string', () => {
      expect(utils.addLeadingSlash('foo/')).toBe('/foo/');
    });
    it('returns a single slash on a empty string input', () => {
      expect(utils.addLeadingSlash('')).toBe('/');
    });
    it('does nothing if there already is a leading slash', () => {
      expect(utils.addLeadingSlash('/foo')).toBe('/foo');
      expect(utils.addLeadingSlash('/')).toBe('/');
    });
  });
  describe('addTrailingSlash', () => {
    it('adds a trailing slash to the provided string', () => {
      expect(utils.addTrailingSlash('/foo')).toBe('/foo/');
    });
    it('returns a single slash on a empty string input', () => {
      expect(utils.addTrailingSlash('')).toBe('/');
    });
    it('does nothing if there already is a trailing slash', () => {
      expect(utils.addTrailingSlash('foo/')).toBe('foo/');
      expect(utils.addTrailingSlash('/')).toBe('/');
    });
  });
  describe('buildUriPath', () => {
    it("converts an ['array', 'of', 'strings'] into a '/proper/uri/path'", () => {
      expect(utils.buildUriPath(['foo', '/bar/', 'baz/'])).toBe('/foo/bar/baz');
      expect(utils.buildUriPath(['////foo', '/bar///', 'baz'])).toBe('/foo/bar/baz');
      expect(utils.buildUriPath(['/', 'foo', ''])).toBe('/foo');
    });
    it('returns an empty string on empty string input', () => {
      expect(utils.buildUriPath([''])).toBe('');
    });
  });
  describe('getProjectPath', () => {
    it('returns the full path to the root of the project', () => {
      expect(utils.getProjectPath('/')).toBe(`${planktonBaseDir}/`);
      expect(utils.getProjectPath()).toBe(planktonBaseDir);
    });
    it('respects the projectPath property as relative to the app root', () => {
      mockConfig.projectPath = 'foo';
      expect(utils.getProjectPath()).toBe(`${planktonBaseDir}/foo`);
      mockConfig.projectPath = 'foo/bar/';
      expect(utils.getProjectPath()).toBe(`${planktonBaseDir}/foo/bar/`);
      mockConfig.projectPath = '../bar';
      expect(utils.getProjectPath()).toBe(path.join(planktonBaseDir, '../bar'));
    });
    it('allows any number of additional path segments as arguments', () => {
      mockConfig.projectPath = 'foo/';
      expect(utils.getProjectPath('../')).toBe(`${planktonBaseDir}/`);
      mockConfig.projectPath = 'foo/bar/';
      expect(utils.getProjectPath('../', 'baz')).toBe(`${planktonBaseDir}/foo/baz`);
      mockConfig.projectPath = '../bar';
      expect(utils.getProjectPath('foo/../bar')).toBe(path.join(planktonBaseDir, '../bar/bar'));
    });
  });
  describe('tryApplicationModule', () => {
    it("returns a loaded module's exported function", async () => {
      const moduleFunc = await utils.tryApplicationModule('utils.test.module1');
      const func = jest.fn();
      await moduleFunc(func);
      expect(func).toHaveBeenCalledWith('this is test module 1');
    });
  });
});
