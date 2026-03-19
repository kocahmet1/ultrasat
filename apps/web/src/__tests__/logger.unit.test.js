const {
  createLogger,
  runWithLogContext,
} = require('../../../api/logger');

describe('structured logger', () => {
  let stdoutWriteSpy;
  let stderrWriteSpy;

  beforeEach(() => {
    stdoutWriteSpy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    stderrWriteSpy = jest.spyOn(process.stderr, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutWriteSpy.mockRestore();
    stderrWriteSpy.mockRestore();
    delete process.env.LOG_LEVEL;
  });

  it('writes redacted JSON logs with request context', () => {
    const logger = createLogger({ component: 'test-logger' });

    runWithLogContext({ requestId: 'req-abc' }, () => {
      logger.info(
        {
          authorization: 'Bearer secret-token',
          nested: {
            token: 'abc123',
          },
        },
        'structured log',
      );
    });

    expect(stdoutWriteSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(stdoutWriteSpy.mock.calls[0][0].trim());

    expect(entry).toEqual(
      expect.objectContaining({
        level: 'info',
        msg: 'structured log',
        component: 'test-logger',
        requestId: 'req-abc',
        authorization: '[Redacted]',
        nested: {
          token: '[Redacted]',
        },
      }),
    );
  });

  it('serializes errors to stderr', () => {
    const logger = createLogger({ component: 'test-logger' });
    const error = new Error('boom');

    logger.error({ operation: 'failing-op' }, error);

    expect(stderrWriteSpy).toHaveBeenCalledTimes(1);
    const entry = JSON.parse(stderrWriteSpy.mock.calls[0][0].trim());

    expect(entry.level).toBe('error');
    expect(entry.operation).toBe('failing-op');
    expect(entry.err).toEqual(
      expect.objectContaining({
        name: 'Error',
        message: 'boom',
      }),
    );
  });
});
