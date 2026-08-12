#!/usr/bin/env node
/**
 * DEPRECATED — superseded before ever being run against Firestore.
 *
 * The canonical cutover script is scripts/retireAndRefreshCommandOfEvidence.js,
 * which mirrors scripts/retireAndRefreshWordsInContext.js (usageContext:'retired'
 * convention, scripts/backups/ + --rollback, exam-attached protection).
 *
 * The cutover was executed on 2026-08-07:
 *   102 old pool questions -> usageContext:'retired'
 *   100 new questions imported (contentSetVersion 'coe-refresh-2026-08')
 *   158 exam-context + 95 exam-attached docs untouched
 * Backups: scripts/backups/coe-retire-2026-08-07T13-46-07-305Z.json
 *          scripts/backups/coe-import-created-ids-2026-08-07T13-46-55-840Z.json
 */
console.error(
  'This script is deprecated. Use: node scripts/retireAndRefreshCommandOfEvidence.js --status | --retire | --import | --rollback'
);
process.exit(1);
