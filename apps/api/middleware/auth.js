function createHttpError(status, message, cause) {
  const error = new Error(message);
  error.status = status;
  error.cause = cause;
  return error;
}

function ensureFirebaseContext(req) {
  const firebaseAdmin = req.admin || req.firebaseAdmin || null;

  if (!firebaseAdmin) {
    return null;
  }

  req.admin = firebaseAdmin;
  req.firebaseAdmin = firebaseAdmin;

  if (!req.db && typeof firebaseAdmin.firestore === 'function') {
    req.db = firebaseAdmin.firestore();
  }

  return firebaseAdmin;
}

function extractBearerToken(req) {
  const authHeader = req.headers?.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  return token || null;
}

function attachAuthenticatedUser(req, decodedToken) {
  req.user = decodedToken;
  req.userId = decodedToken?.uid || req.userId || null;
  req.userEmail = decodedToken?.email || req.userEmail || null;
  return decodedToken;
}

async function authenticateRequest(
  req,
  {
    allowMissingToken = false,
    allowInvalidToken = false,
    missingTokenMessage = 'Unauthorized - No token provided',
    invalidTokenMessage = 'Unauthorized - Invalid token',
    missingAdminMessage = 'Firebase Admin not available',
    logLabel = 'Error verifying token',
  } = {},
) {
  if (req.user?.uid) {
    ensureFirebaseContext(req);
    return attachAuthenticatedUser(req, req.user);
  }

  const token = extractBearerToken(req);
  if (!token) {
    if (allowMissingToken) {
      return null;
    }

    throw createHttpError(401, missingTokenMessage);
  }

  const firebaseAdmin = ensureFirebaseContext(req);
  if (!firebaseAdmin) {
    throw createHttpError(500, missingAdminMessage);
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    return attachAuthenticatedUser(req, decodedToken);
  } catch (error) {
    if (allowInvalidToken) {
      return null;
    }

    if (logLabel) {
      console.error(`${logLabel}:`, error);
    }

    throw createHttpError(401, invalidTokenMessage, error);
  }
}

async function isAdminUser(
  req,
  user = req.user,
  {
    missingDbMessage = 'Firestore not available for admin verification',
    adminCheckFailedMessage = 'Server error during admin verification',
    logLabel = 'Error checking admin access',
  } = {},
) {
  ensureFirebaseContext(req);

  if (!user?.uid) {
    return false;
  }

  if (req.user?.uid === user.uid && typeof req.isAdmin === 'boolean') {
    return req.isAdmin;
  }

  if (!req.db) {
    throw createHttpError(500, missingDbMessage);
  }

  try {
    const userDoc = await req.db.collection('users').doc(user.uid).get();
    const isAdmin = Boolean(userDoc.exists && userDoc.data()?.isAdmin);

    if (req.user?.uid === user.uid) {
      req.isAdmin = isAdmin;
      req.userRecord = userDoc.exists ? userDoc.data() : null;
    }

    return isAdmin;
  } catch (error) {
    if (logLabel) {
      console.error(`${logLabel}:`, error);
    }

    throw createHttpError(500, adminCheckFailedMessage, error);
  }
}

function requireAuth(options = {}) {
  return async (req, res, next) => {
    try {
      await authenticateRequest(req, options);
      next();
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error('Error in auth middleware:', error);
      return res.status(500).json({ error: 'Server error during authentication' });
    }
  };
}

function requireAdmin(options = {}) {
  return async (req, res, next) => {
    try {
      await authenticateRequest(req, {
        ...options,
        logLabel: options.authLogLabel || options.logLabel,
      });

      const hasAdminAccess = await isAdminUser(req, req.user, {
        ...options,
        logLabel: options.adminLogLabel || options.logLabel,
      });
      if (!hasAdminAccess) {
        return res.status(403).json({
          error: options.adminRequiredMessage || 'Unauthorized: Admin access required',
        });
      }

      next();
    } catch (error) {
      if (error.status) {
        return res.status(error.status).json({ error: error.message });
      }

      console.error('Error in admin middleware:', error);
      return res.status(500).json({
        error: options.adminCheckFailedMessage || 'Server error during admin verification',
      });
    }
  };
}

module.exports = {
  authenticateRequest,
  extractBearerToken,
  isAdminUser,
  requireAdmin,
  requireAuth,
};
