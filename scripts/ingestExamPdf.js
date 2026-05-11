#!/usr/bin/env node
/**
 * Official SAT Exam PDF Ingestion Tool
 * ====================================
 *
 * A 4-stage pipeline that extracts questions from official SAT exam PDFs
 * and imports them into the Ultrasat practice exam system.
 *
 * Usage:
 *   node scripts/ingestExamPdf.js <pdf-path> --exam-name "Official SAT Aug 2024"
 *   node scripts/ingestExamPdf.js <pdf-path> --exam-name "..." --dry-run
 *   node scripts/ingestExamPdf.js <pdf-path> --exam-name "..." --no-upload
 *   node scripts/ingestExamPdf.js --upload-only scripts/output/<slug>_final.json
 *   node scripts/ingestExamPdf.js <pdf-path> --exam-name "..." --skip-validation
 */

const fs = require('fs');
const path = require('path');

// ── CLI argument parsing ────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    pdfPath: null,
    examName: null,
    dryRun: false,
    noUpload: false,
    uploadOnly: null,
    skipValidation: false,
    model: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--exam-name' && args[i + 1]) {
      parsed.examName = args[++i];
    } else if (arg === '--dry-run') {
      parsed.dryRun = true;
    } else if (arg === '--no-upload') {
      parsed.noUpload = true;
    } else if (arg === '--upload-only' && args[i + 1]) {
      parsed.uploadOnly = args[++i];
    } else if (arg === '--skip-validation') {
      parsed.skipValidation = true;
    } else if (arg === '--model' && args[i + 1]) {
      parsed.model = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (!arg.startsWith('--')) {
      parsed.pdfPath = arg;
    }
  }

  return parsed;
}

function printHelp() {
  console.log(`
📄 Official SAT Exam PDF Ingestion Tool
========================================

Usage:
  node scripts/ingestExamPdf.js <pdf-path> --exam-name "<name>" [options]

Options:
  --exam-name "<name>"    Required. Human-readable exam name (e.g., "Official SAT Aug 2024")
  --dry-run               Run full pipeline but don't write to Firestore
  --no-upload             Extract + validate + normalize, but skip upload
  --upload-only <json>    Skip extraction, upload from a previously generated _final.json
  --skip-validation       Skip Stage 2 (AI validation)
  --model <model>         OpenAI model to use (default: gpt-5.4)
  --help, -h              Show this help

Examples:
  node scripts/ingestExamPdf.js "docs/exam.pdf" --exam-name "Official SAT Aug 2024"
  node scripts/ingestExamPdf.js "docs/exam.pdf" --exam-name "Official SAT Aug 2024" --dry-run
  node scripts/ingestExamPdf.js --upload-only scripts/output/official-sat-aug-2024_final.json
  `);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function loadEnvFile() {
  // Try to load .env from project root
  const envPath = path.resolve(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim();
        const value = trimmed.substring(eqIdx + 1).trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    }
  }
}

function getApiKey() {
  loadEnvFile();
  const key = process.env.OPENAI_API_KEY;
  if (!key || key.startsWith('your_')) {
    console.error('❌ OPENAI_API_KEY not set. Please set it in your .env file.');
    process.exit(1);
  }
  return key;
}

// ── Main Pipeline ───────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs();
  const outputDir = path.resolve(__dirname, 'output');

  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // ── Upload-only mode ──
  if (args.uploadOnly) {
    const jsonPath = path.resolve(args.uploadOnly);
    if (!fs.existsSync(jsonPath)) {
      console.error(`❌ File not found: ${jsonPath}`);
      process.exit(1);
    }

    console.log(`\n📄 Upload-only mode`);
    console.log(`═══════════════════\n`);

    const normalizedData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

    console.log(`[4/4] UPLOADING to Firestore${args.dryRun ? ' (DRY RUN)' : ''}...`);
    const { uploadToFirestore } = require('./lib/firestoreUploader');
    const uploadResult = await uploadToFirestore(normalizedData, { dryRun: args.dryRun });
    printUploadResult(uploadResult);
    return;
  }

  // ── Validate arguments ──
  if (!args.pdfPath) {
    console.error('❌ PDF path is required. Use --help for usage.');
    process.exit(1);
  }
  if (!args.examName) {
    console.error('❌ --exam-name is required. Use --help for usage.');
    process.exit(1);
  }

  const pdfPath = path.resolve(args.pdfPath);
  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ PDF file not found: ${pdfPath}`);
    process.exit(1);
  }

  const examSlug = slugify(args.examName);
  const apiKey = getApiKey();
  const aiModel = args.model || 'gpt-5.4';

  console.log(`\n📄 PDF Ingestion Pipeline: ${args.examName}`);
  console.log(`═══════════════════════════════════════════════════\n`);
  console.log(`   PDF: ${path.basename(pdfPath)}`);
  console.log(`   Slug: ${examSlug}`);
  console.log(`   Model: ${aiModel}`);
  console.log(`   Mode: ${args.dryRun ? 'DRY RUN' : args.noUpload ? 'NO UPLOAD' : 'FULL'}\n`);

  const startTime = Date.now();

  // ══════════════════════════════════════════════════════════════════════════
  // Stage 1: EXTRACT
  // ══════════════════════════════════════════════════════════════════════════
  console.log(`[1/4] EXTRACTING from PDF...`);

  const { extractFromPdf } = require('./lib/openaiPdfExtractor');
  const extractedData = await extractFromPdf(pdfPath, {
    apiKey,
    model: aiModel,
  });

  // Save raw extraction
  const rawPath = path.join(outputDir, `${examSlug}_raw.json`);
  fs.writeFileSync(rawPath, JSON.stringify(extractedData, null, 2));
  console.log(`      → Saved: ${path.relative(process.cwd(), rawPath)}\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // Stage 2: VALIDATE
  // ══════════════════════════════════════════════════════════════════════════
  let validationReport = null;

  if (args.skipValidation) {
    console.log(`[2/4] VALIDATION skipped (--skip-validation)\n`);
  } else {
    console.log(`[2/4] VALIDATING extraction against PDF...`);

    const { runValidationWithAutoFix } = require('./lib/openaiValidator');
    validationReport = await runValidationWithAutoFix(pdfPath, extractedData, {
      apiKey,
      model: aiModel,
    });

    // Print validation summary
    const questionCounts = validationReport.questionCounts;
    if (questionCounts) {
      for (const [modKey, counts] of Object.entries(questionCounts)) {
        const status = counts.match ? '✓' : '✗';
        console.log(`      ${status} ${modKey}: PDF=${counts.pdf}, JSON=${counts.json}`);
      }
    }

    const criticalCount = validationReport.issues.filter(i => i.severity === 'critical').length;
    const warningCount = validationReport.issues.filter(i => i.severity === 'warning').length;

    console.log(`      → Status: ${validationReport.overallStatus} (${criticalCount} critical, ${warningCount} warnings)`);

    if (validationReport._totalFixesApplied > 0) {
      console.log(`      → Auto-fixes applied: ${validationReport._totalFixesApplied}`);
    }

    // Save validation report
    const validationPath = path.join(outputDir, `${examSlug}_validation.json`);
    fs.writeFileSync(validationPath, JSON.stringify(validationReport, null, 2));

    // Save fixed raw data (overwrite)
    fs.writeFileSync(rawPath, JSON.stringify(extractedData, null, 2));

    if (validationReport.overallStatus === 'FAIL') {
      console.log(`\n      ❌ VALIDATION FAILED with unresolved critical issues.`);
      console.log(`      Review: ${path.relative(process.cwd(), validationPath)}`);
      // Print the critical issues
      for (const issue of validationReport.issues.filter(i => i.severity === 'critical')) {
        console.log(`        • Module ${issue.moduleNumber}, Q${issue.questionNumber}: ${issue.description}`);
      }
      console.log(`\n      Fix the issues in ${path.relative(process.cwd(), rawPath)} and re-run with:`);
      console.log(`      node scripts/ingestExamPdf.js --upload-only <final.json>\n`);
      process.exit(1);
    }

    if (validationReport.warning) {
      console.log(`      ⚠️  ${validationReport.warning}`);
    }

    console.log('');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // Stage 3: NORMALIZE
  // ══════════════════════════════════════════════════════════════════════════
  console.log(`[3/4] NORMALIZING data...`);

  const { normalizeExamData } = require('./lib/examNormalizer');
  const normalizedData = normalizeExamData(extractedData, examSlug, args.examName);

  console.log(`      ✓ Subcategory mapping: ${normalizedData.stats.subcategoryMapped}/${normalizedData.stats.totalQuestions} mapped`);
  if (normalizedData.stats.subcategoryUnmapped > 0) {
    console.log(`      ⚠️  ${normalizedData.stats.subcategoryUnmapped} questions with unmapped subcategories`);
  }
  console.log(`      ✓ Schema validation: ${normalizedData.stats.totalQuestions} questions normalized`);

  if (normalizedData.warnings.length > 0) {
    console.log(`      ⚠️  ${normalizedData.warnings.length} warnings:`);
    for (const w of normalizedData.warnings.slice(0, 5)) {
      console.log(`        • ${w}`);
    }
    if (normalizedData.warnings.length > 5) {
      console.log(`        ... and ${normalizedData.warnings.length - 5} more`);
    }
  }

  // Save normalized data
  const finalPath = path.join(outputDir, `${examSlug}_final.json`);
  fs.writeFileSync(finalPath, JSON.stringify(normalizedData, null, 2));
  console.log(`      → Saved: ${path.relative(process.cwd(), finalPath)}\n`);

  // ══════════════════════════════════════════════════════════════════════════
  // Stage 4: UPLOAD
  // ══════════════════════════════════════════════════════════════════════════
  if (args.noUpload) {
    console.log(`[4/4] UPLOAD skipped (--no-upload)`);
    console.log(`\n      To upload later, run:`);
    console.log(`      node scripts/ingestExamPdf.js --upload-only ${path.relative(process.cwd(), finalPath)}\n`);
  } else {
    console.log(`[4/4] UPLOADING to Firestore${args.dryRun ? ' (DRY RUN)' : ''}...`);

    const { uploadToFirestore } = require('./lib/firestoreUploader');
    const uploadResult = await uploadToFirestore(normalizedData, { dryRun: args.dryRun });
    printUploadResult(uploadResult);
  }

  // ── Summary ──
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n⏱️  Completed in ${elapsed}s`);
  console.log(`🎉 Done!\n`);
}

function printUploadResult(result) {
  const prefix = result.dryRun ? '(dry-run) ' : '';

  console.log(`      ${prefix}✓ ${result.questionsCreated} questions created`);
  console.log(`      ${prefix}✓ ${result.modulesCreated} exam modules created`);
  console.log(`      ${prefix}✓ ${result.examCreated ? '1' : '0'} practice exam created`);

  if (result.duplicatesSkipped) {
    console.log(`      ${prefix}⚠️  ${result.duplicatesSkipped} duplicate questions skipped`);
  }

  if (result.examId && !result.dryRun) {
    console.log(`      → Exam ID: ${result.examId}`);
  }

  if (result.errors.length > 0) {
    console.log(`      ❌ ${result.errors.length} errors:`);
    for (const err of result.errors.slice(0, 5)) {
      console.log(`        • ${err}`);
    }
  }
}

// ── Run ─────────────────────────────────────────────────────────────────────

main().catch(err => {
  console.error(`\n❌ Pipeline failed: ${err.message}`);
  if (err.stack) {
    console.error(err.stack);
  }
  process.exit(1);
});
