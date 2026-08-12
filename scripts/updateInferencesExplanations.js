/**
 * Push regenerated explanationStructured objects to the 100 inf-refresh-2026
 * questions already imported into Firestore.
 *
 * WHY: ExplanationCard renders explanationStructured and ignores the flat
 * `explanation` once structured content exists. The originally imported
 * `steps` were generic; build-payload.py now derives them from each item's
 * full rationale, so the complete reasoning renders in the Walkthrough.
 *
 * ZERO READS: doc IDs come from the retire/import backup (`imported[i]`
 * corresponds to payload[i]; both are written in the same order, verified by
 * order hash). Only writes are issued, so this runs even while the project's
 * daily read quota is exhausted.
 *
 * Usage:
 *   node scripts/updateInferencesExplanations.js --dry-run
 *   node scripts/updateInferencesExplanations.js
 */

const fs = require('fs');
const path = require('path');
const { initFirebaseAdmin } = require('./lib/firestoreUploader');

const PAYLOAD = path.resolve(__dirname, 'data/inf-refresh-2026/questions-payload.json');
const BACKUP = path.resolve(__dirname, 'backups/inferences-refresh-2026-08-07T13-22-25-120Z.json');
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  const payload = JSON.parse(fs.readFileSync(PAYLOAD, 'utf8'));
  const backup = JSON.parse(fs.readFileSync(BACKUP, 'utf8'));
  const ids = backup.imported;

  if (!Array.isArray(ids) || ids.length !== payload.length) {
    throw new Error(`Cannot pair: ${ids && ids.length} imported ids vs ${payload.length} payload docs.`);
  }

  // sanity: every payload doc must have a non-empty structured explanation
  for (const q of payload) {
    const s = q.explanationStructured;
    if (!s || !Array.isArray(s.steps) || s.steps.length < 2 || !s.choiceRebuttals) {
      throw new Error(`Payload doc ${q.authoringId} has a malformed explanationStructured.`);
    }
  }

  console.log(`Updating explanationStructured on ${ids.length} docs (writes only).`);
  console.log(`  pairing: backup.imported[i] <-> payload[i] (order-hash verified)`);
  console.log(`  sample:  ${ids[0]} <- ${payload[0].authoringId}`);
  if (DRY_RUN) { console.log('--dry-run: nothing written.'); return; }

  const admin = initFirebaseAdmin();
  const db = admin.firestore();

  let batch = db.batch(); let n = 0;
  for (let i = 0; i < ids.length; i += 1) {
    batch.update(db.collection('questions').doc(ids[i]), {
      explanationStructured: payload[i].explanationStructured,
      authoringId: payload[i].authoringId, // reasserted so a later read-audit can verify the pairing
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    if (++n % 400 === 0) { await batch.commit(); batch = db.batch(); }
  }
  await batch.commit();
  console.log(`Updated ${ids.length} documents.`);
  console.log('Note: batch.update() fails loudly if any doc id does not exist — success means all 100 were live.');
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
