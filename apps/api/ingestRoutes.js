/**
 * Exam Ingestion API Routes
 *
 * Provides a streaming (SSE) endpoint that accepts a PDF upload,
 * runs all 4 ingestion stages, and streams progress events back to the client.
 *
 * POST /api/ingest/run   — multipart form: pdf file + examName + options
 * GET  /api/ingest/run   — SSE stream (after POST triggers via shared job state)
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');
const router = express.Router();

// Configure multer for temp PDF storage
const upload = multer({
  dest: path.join(os.tmpdir(), 'ultrasat-ingest'),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// In-memory job store (single-user admin tool, no need for persistence)
const jobs = new Map();

/**
 * POST /api/ingest/run
 * Upload PDF and start the ingestion pipeline.
 * Returns a jobId for SSE status streaming.
 */
router.post('/run', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded' });
    }

    const { examName, dryRun, skipValidation } = req.body;

    if (!examName) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'examName is required' });
    }

    const jobId = `ingest-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const slugifiedName = examName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Store job state
    const job = {
      id: jobId,
      status: 'pending',
      examName,
      examSlug: slugifiedName,
      pdfPath: req.file.path,
      dryRun: dryRun === 'true' || dryRun === true,
      skipValidation: skipValidation === 'true' || skipValidation === true,
      stages: {
        extract: { status: 'pending', data: null },
        validate: { status: 'pending', data: null },
        normalize: { status: 'pending', data: null },
        upload: { status: 'pending', data: null },
      },
      logs: [],
      error: null,
      createdAt: new Date(),
    };

    jobs.set(jobId, job);

    // Return jobId immediately, run pipeline async
    res.json({ jobId, examSlug: slugifiedName });

    // Run the pipeline in the background
    runPipeline(job, req).catch(err => {
      job.status = 'failed';
      job.error = err.message;
      addLog(job, 'error', `Pipeline failed: ${err.message}`);
    });

  } catch (err) {
    console.error('Ingest upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/ingest/status/:jobId
 * SSE stream for real-time progress updates.
 */
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering

  // Send current state immediately
  sendSSE(res, 'state', getJobSnapshot(job));

  // Send all existing logs
  for (const log of job.logs) {
    sendSSE(res, 'log', log);
  }

  // Set up a polling interval
  let lastLogIndex = job.logs.length;
  const interval = setInterval(() => {
    // Send new logs
    while (lastLogIndex < job.logs.length) {
      sendSSE(res, 'log', job.logs[lastLogIndex]);
      lastLogIndex++;
    }

    // Send state update
    sendSSE(res, 'state', getJobSnapshot(job));

    // Close if done
    if (job.status === 'completed' || job.status === 'failed') {
      sendSSE(res, 'done', { status: job.status, error: job.error });
      clearInterval(interval);
      res.end();
    }
  }, 500);

  // Clean up on client disconnect
  req.on('close', () => {
    clearInterval(interval);
  });
});

/**
 * GET /api/ingest/result/:jobId
 * Get the final result of a completed job.
 */
router.get('/result/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    status: job.status,
    examName: job.examName,
    examSlug: job.examSlug,
    stages: {
      extract: { status: job.stages.extract.status },
      validate: { status: job.stages.validate.status, data: job.stages.validate.data },
      normalize: { status: job.stages.normalize.status, data: job.stages.normalize.data?.stats },
      upload: { status: job.stages.upload.status, data: job.stages.upload.data },
    },
    error: job.error,
  });
});

// ── Helpers ──────────────────────────────────────────────────────────────────

function sendSSE(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function addLog(job, level, message) {
  job.logs.push({ level, message, timestamp: new Date().toISOString() });
}

function getJobSnapshot(job) {
  return {
    status: job.status,
    examName: job.examName,
    examSlug: job.examSlug,
    dryRun: job.dryRun,
    stages: {
      extract: { status: job.stages.extract.status },
      validate: { status: job.stages.validate.status },
      normalize: { status: job.stages.normalize.status },
      upload: { status: job.stages.upload.status },
    },
    error: job.error,
  };
}

// ── Pipeline Runner ─────────────────────────────────────────────────────────

async function runPipeline(job, req) {
  const openaiApiKey = process.env.OPENAI_API_KEY;

  if (!openaiApiKey || openaiApiKey.startsWith('your_')) {
    throw new Error('OPENAI_API_KEY not configured on server');
  }

  job.status = 'running';

  // Resolve library paths relative to project root
  const scriptsLib = path.resolve(__dirname, '../../scripts/lib');
  const aiModel = 'gpt-5.4';

  // ── Stage 1: EXTRACT ──
  addLog(job, 'info', '📄 Stage 1: Extracting questions from PDF...');
  job.stages.extract.status = 'running';

  try {
    const { extractFromPdf } = require(path.join(scriptsLib, 'openaiPdfExtractor'));
    const extractedData = await extractFromPdf(job.pdfPath, {
      apiKey: openaiApiKey,
      model: aiModel,
    });

    job.stages.extract.status = 'completed';
    job.stages.extract.data = extractedData;

    const totalQ = extractedData.modules.reduce((sum, m) => sum + m.questions.length, 0);
    addLog(job, 'success', `✅ Extraction complete: ${totalQ} questions across ${extractedData.modules.length} modules`);

    for (const mod of extractedData.modules) {
      addLog(job, 'info', `   Module ${mod.moduleNumber}: ${mod.questions.length} questions (${mod.section || 'N/A'})`);
    }
  } catch (err) {
    job.stages.extract.status = 'failed';
    throw new Error(`Extraction failed: ${err.message}`);
  }

  // ── Stage 2: VALIDATE ──
  if (job.skipValidation) {
    job.stages.validate.status = 'skipped';
    addLog(job, 'info', '⏭️ Stage 2: Validation skipped');
  } else {
    addLog(job, 'info', '🔍 Stage 2: AI validation against original PDF...');
    job.stages.validate.status = 'running';

    try {
      const { runValidationWithAutoFix } = require(path.join(scriptsLib, 'openaiValidator'));
      const report = await runValidationWithAutoFix(job.pdfPath, job.stages.extract.data, {
        apiKey: openaiApiKey,
        model: aiModel,
      });

      job.stages.validate.status = 'completed';
      job.stages.validate.data = report;

      const critical = report.issues.filter(i => i.severity === 'critical').length;
      const warnings = report.issues.filter(i => i.severity === 'warning').length;
      addLog(job, 'success', `✅ Validation: ${report.overallStatus} (${critical} critical, ${warnings} warnings)`);

      if (report._totalFixesApplied > 0) {
        addLog(job, 'info', `   🔧 Auto-fixes applied: ${report._totalFixesApplied}`);
      }

      if (report.overallStatus === 'FAIL') {
        addLog(job, 'warning', '⚠️ Critical issues remain — proceeding with warnings');
      }
    } catch (err) {
      job.stages.validate.status = 'failed';
      addLog(job, 'warning', `⚠️ Validation failed: ${err.message}. Proceeding anyway.`);
    }
  }

  // ── Stage 3: NORMALIZE ──
  addLog(job, 'info', '🔧 Stage 3: Normalizing data to Firestore schema...');
  job.stages.normalize.status = 'running';

  try {
    const { normalizeExamData } = require(path.join(scriptsLib, 'examNormalizer'));
    const normalizedData = normalizeExamData(job.stages.extract.data, job.examSlug, job.examName);

    job.stages.normalize.status = 'completed';
    job.stages.normalize.data = normalizedData;

    addLog(job, 'success', `✅ Normalization complete: ${normalizedData.stats.totalQuestions} questions`);
    addLog(job, 'info', `   Subcategories mapped: ${normalizedData.stats.subcategoryMapped}/${normalizedData.stats.totalQuestions}`);

    if (normalizedData.warnings.length > 0) {
      addLog(job, 'warning', `   ${normalizedData.warnings.length} warnings (see details below)`);
      for (const w of normalizedData.warnings.slice(0, 5)) {
        addLog(job, 'warning', `   • ${w}`);
      }
    }
  } catch (err) {
    job.stages.normalize.status = 'failed';
    throw new Error(`Normalization failed: ${err.message}`);
  }

  // ── Stage 4: UPLOAD ──
  if (job.dryRun) {
    addLog(job, 'info', '🏁 Stage 4: Upload (DRY RUN — no data written)...');
  } else {
    addLog(job, 'info', '🔥 Stage 4: Uploading to Firestore...');
  }
  job.stages.upload.status = 'running';

  try {
    const { uploadToFirestore } = require(path.join(scriptsLib, 'firestoreUploader'));
    const uploadResult = await uploadToFirestore(job.stages.normalize.data, {
      dryRun: job.dryRun,
    });

    job.stages.upload.status = 'completed';
    job.stages.upload.data = uploadResult;

    const prefix = job.dryRun ? '(dry-run) ' : '';
    addLog(job, 'success', `✅ ${prefix}Upload complete`);
    addLog(job, 'info', `   ${prefix}${uploadResult.questionsCreated} questions created`);
    addLog(job, 'info', `   ${prefix}${uploadResult.modulesCreated} modules created`);
    addLog(job, 'info', `   ${prefix}${uploadResult.examCreated ? '1' : '0'} practice exam created`);

    if (uploadResult.duplicatesSkipped) {
      addLog(job, 'warning', `   ${uploadResult.duplicatesSkipped} duplicate questions skipped`);
    }
    if (uploadResult.examId && !job.dryRun) {
      addLog(job, 'info', `   Exam ID: ${uploadResult.examId}`);
    }
    if (uploadResult.errors?.length > 0) {
      for (const err of uploadResult.errors) {
        addLog(job, 'error', `   ❌ ${err}`);
      }
    }
  } catch (err) {
    job.stages.upload.status = 'failed';
    throw new Error(`Upload failed: ${err.message}`);
  }

  // ── Cleanup ──
  job.status = 'completed';
  addLog(job, 'success', '🎉 Pipeline complete!');

  // Clean up temp PDF
  try {
    fs.unlinkSync(job.pdfPath);
  } catch {}
}

module.exports = router;
