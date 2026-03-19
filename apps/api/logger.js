const { AsyncLocalStorage } = require('async_hooks');
const { randomUUID } = require('crypto');

const LOG_LEVELS = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
};

const REDACTED_KEYS = [
  'authorization',
  'cookie',
  'password',
  'token',
  'access_token',
  'refresh_token',
  'api_key',
  'apikey',
  'secret',
  'client_secret',
  'private_key',
  'stripe-signature',
];

const MAX_STRING_LENGTH = 4000;
const requestContextStorage = new AsyncLocalStorage();

let consoleBridgeInstalled = false;
let consoleBridgeLogger = null;

function getConfiguredLevel() {
  const configuredLevel = String(process.env.LOG_LEVEL || 'info').toLowerCase();
  return LOG_LEVELS[configuredLevel] ? configuredLevel : 'info';
}

function shouldRedactKey(key) {
  const normalizedKey = String(key || '').toLowerCase();
  return REDACTED_KEYS.some((candidate) => normalizedKey.includes(candidate));
}

function maskSensitiveString(value) {
  return String(value)
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [Redacted]')
    .replace(/sk-[A-Za-z0-9_-]+/g, '[Redacted]')
    .replace(/AIza[0-9A-Za-z_-]+/g, '[Redacted]');
}

function truncateString(value) {
  const masked = maskSensitiveString(value);
  if (masked.length <= MAX_STRING_LENGTH) {
    return masked;
  }

  return `${masked.slice(0, MAX_STRING_LENGTH)}...[truncated]`;
}

function serializeError(error) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}

function sanitizeValue(value, key, seen = new WeakSet()) {
  if (value == null) {
    return value;
  }

  if (shouldRedactKey(key)) {
    return '[Redacted]';
  }

  if (value instanceof Error) {
    return serializeError(value);
  }

  if (Buffer.isBuffer(value)) {
    return {
      type: 'Buffer',
      length: value.length,
    };
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item, key, seen));
  }

  if (typeof value === 'string') {
    return truncateString(value);
  }

  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }

  if (typeof value === 'object') {
    if (seen.has(value)) {
      return '[Circular]';
    }

    seen.add(value);

    const sanitized = {};
    Object.entries(value).forEach(([entryKey, entryValue]) => {
      sanitized[entryKey] = sanitizeValue(entryValue, entryKey, seen);
    });

    seen.delete(value);
    return sanitized;
  }

  return value;
}

function sanitizeBindings(bindings) {
  return sanitizeValue(bindings || {}, null);
}

function extractLogPayload(args) {
  const fields = {};
  const messageParts = [];

  args.forEach((arg) => {
    if (arg instanceof Error) {
      fields.err = serializeError(arg);
      if (!messageParts.length) {
        messageParts.push(arg.message);
      }
      return;
    }

    if (typeof arg === 'string') {
      messageParts.push(truncateString(arg));
      return;
    }

    if (arg && typeof arg === 'object' && !Array.isArray(arg)) {
      Object.assign(fields, sanitizeValue(arg));
      return;
    }

    messageParts.push(truncateString(String(arg)));
  });

  const msg = messageParts.join(' ').trim() || undefined;
  return { msg, fields };
}

function writeLog(level, bindings, args) {
  if (LOG_LEVELS[level] < LOG_LEVELS[getConfiguredLevel()]) {
    return;
  }

  const { msg, fields } = extractLogPayload(args);
  const context = requestContextStorage.getStore() || {};
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: 'ultrasat-api',
    ...sanitizeBindings(bindings),
    ...sanitizeBindings(context),
    ...fields,
  };

  if (msg) {
    entry.msg = msg;
  }

  const serialized = `${JSON.stringify(entry)}\n`;
  if (level === 'error') {
    process.stderr.write(serialized);
    return;
  }

  process.stdout.write(serialized);
}

function createLogger(bindings = {}) {
  const sanitizedBindings = sanitizeBindings(bindings);

  return {
    __isStructuredLogger: true,
    child(childBindings = {}) {
      return createLogger({
        ...sanitizedBindings,
        ...sanitizeBindings(childBindings),
      });
    },
    debug(...args) {
      writeLog('debug', sanitizedBindings, args);
    },
    info(...args) {
      writeLog('info', sanitizedBindings, args);
    },
    log(...args) {
      writeLog('info', sanitizedBindings, args);
    },
    warn(...args) {
      writeLog('warn', sanitizedBindings, args);
    },
    error(...args) {
      writeLog('error', sanitizedBindings, args);
    },
  };
}

function normalizeLogger(candidate = logger) {
  if (candidate?.__isStructuredLogger) {
    return candidate;
  }

  const fallback = createLogger();

  const loggerLike = {
    debug:
      typeof candidate?.debug === 'function'
        ? candidate.debug.bind(candidate)
        : typeof candidate?.log === 'function'
          ? candidate.log.bind(candidate)
          : fallback.debug.bind(fallback),
    info:
      typeof candidate?.info === 'function'
        ? candidate.info.bind(candidate)
        : typeof candidate?.log === 'function'
          ? candidate.log.bind(candidate)
          : fallback.info.bind(fallback),
    warn:
      typeof candidate?.warn === 'function'
        ? candidate.warn.bind(candidate)
        : fallback.warn.bind(fallback),
    error:
      typeof candidate?.error === 'function'
        ? candidate.error.bind(candidate)
        : fallback.error.bind(fallback),
  };

  loggerLike.log = loggerLike.info;
  loggerLike.child = (bindings = {}) => {
    if (typeof candidate?.child === 'function') {
      return normalizeLogger(candidate.child(bindings));
    }

    return loggerLike;
  };

  return loggerLike;
}

function runWithLogContext(context, callback) {
  return requestContextStorage.run(sanitizeBindings(context), callback);
}

function createRequestLoggingMiddleware(baseLogger) {
  const requestLoggerBase = normalizeLogger(baseLogger);

  return (req, res, next) => {
    const requestIdHeader = req.headers['x-request-id'];
    const requestId =
      typeof requestIdHeader === 'string' && requestIdHeader.trim()
        ? requestIdHeader.trim()
        : randomUUID();
    const startedAt = Date.now();
    const requestLogger = requestLoggerBase.child({ requestId });
    const requestPath = req.originalUrl || req.url;

    req.requestId = requestId;
    req.log = requestLogger;
    res.setHeader('X-Request-Id', requestId);

    runWithLogContext({ requestId }, () => {
      requestLogger.info(
        {
          event: 'request.started',
          method: req.method,
          path: requestPath,
          ip: req.ip,
        },
        'request.started',
      );

      let completed = false;

      res.on('finish', () => {
        completed = true;
        requestLogger.info(
          {
            event: 'request.completed',
            method: req.method,
            path: requestPath,
            statusCode: res.statusCode,
            durationMs: Date.now() - startedAt,
          },
          'request.completed',
        );
      });

      res.on('close', () => {
        if (completed) {
          return;
        }

        requestLogger.warn(
          {
            event: 'request.aborted',
            method: req.method,
            path: requestPath,
            durationMs: Date.now() - startedAt,
          },
          'request.aborted',
        );
      });

      next();
    });
  };
}

function installConsoleBridge(baseLogger = logger) {
  consoleBridgeLogger = normalizeLogger(baseLogger);

  if (consoleBridgeInstalled) {
    return;
  }

  console.log = (...args) => {
    consoleBridgeLogger.debug(...args);
  };
  console.info = (...args) => {
    consoleBridgeLogger.info(...args);
  };
  console.warn = (...args) => {
    consoleBridgeLogger.warn(...args);
  };
  console.error = (...args) => {
    consoleBridgeLogger.error(...args);
  };

  consoleBridgeInstalled = true;
}

const logger = createLogger({
  environment: process.env.NODE_ENV || 'development',
});

module.exports = {
  createLogger,
  createRequestLoggingMiddleware,
  installConsoleBridge,
  logger,
  normalizeLogger,
  runWithLogContext,
};
