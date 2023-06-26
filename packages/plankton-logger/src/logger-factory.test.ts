const mockRootLogger = { child: jest.fn(), level: undefined };
const mockPino = jest.fn().mockReturnValue(mockRootLogger);

jest.mock('pino', () => mockPino);

describe('LoggerFactory', () => {
  describe('init', () => {
    beforeEach(() => {
      delete process.env.LOGGING_LEVEL;
      jest.resetModules();
    });
    it('sets the root logger level to a default of `info`', async () => {
      await import('./logger-factory');
      expect(mockRootLogger.level).toBe('info');
    });
    it('sets the root level using the LOGGING_LEVEL env var', async () => {
      process.env.LOGGING_LEVEL = 'debug';
      await import('./logger-factory');
      expect(mockRootLogger.level).toBe('debug');
    });
  });
  describe('getLogger', () => {
    beforeEach(() => {
      delete process.env.LOGGING_LEVEL;
      delete process.env.LOGGING_LEVEL_FOO;
      delete process.env.LOGGING_LEVEL_FOO_BAR;
      delete process.env.LOGGING_LEVEL_FOO_BARBAZ;
      jest.resetModules();
    });
    it('uses the default logging level when no property matches', async () => {
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('foo.bar');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'foo.bar',
        },
        {
          name: 'foo.bar',
          level: 'info',
        },
      );
    });
    it('uses the default logging level as configured when no property matches', async () => {
      process.env.LOGGING_LEVEL = 'debug';
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('foo.bar');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'foo.bar',
        },
        {
          name: 'foo.bar',
          level: 'debug',
        },
      );
    });
    it('uses the configured parent logger level', async () => {
      process.env.LOGGING_LEVEL_FOO = 'warn';
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('foo.bar');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'foo.bar',
        },
        {
          name: 'foo.bar',
          level: 'warn',
        },
      );
    });
    it('uses the matching logger level', async () => {
      process.env.LOGGING_LEVEL_FOO_BAR = 'trace';
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('foo.bar');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'foo.bar',
        },
        {
          name: 'foo.bar',
          level: 'trace',
        },
      );
    });
    it('does not use a child level with a parent logger', async () => {
      process.env.LOGGING_LEVEL_FOO_BAR = 'warn';
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('foo');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'foo',
        },
        {
          name: 'foo',
          level: 'info',
        },
      );
    });
    it('uses an ancestor logging level', async () => {
      process.env.LOGGING_LEVEL_FOO_BAR = 'trace';
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('foo.bar.baz.qux');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'foo.bar.baz.qux',
        },
        {
          name: 'foo.bar.baz.qux',
          level: 'trace',
        },
      );
    });
    it('works with camelCase logger names', async () => {
      process.env.LOGGING_LEVEL_FOO_BARBAZ = 'debug';
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('foo.barBaz');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'foo.barBaz',
        },
        {
          name: 'foo.barBaz',
          level: 'debug',
        },
      );
    });
    it('falls back to the default level when the logger name is garbage', async () => {
      process.env.LOGGING_LEVEL = 'error';
      const LoggerFactory = (await import('./logger-factory')).default;
      LoggerFactory.getLogger('blah foo');
      expect(mockRootLogger.child).toHaveBeenCalledWith(
        {
          name: 'blah foo',
        },
        {
          name: 'blah foo',
          level: 'error',
        },
      );
    });
  });
});
