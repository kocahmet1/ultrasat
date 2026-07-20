/**
 * Export English modules (module 1 & 2) of all practice exams to JSON for QC.
 * Run from repo root:  node scripts/exportPracticeExamsEnglish.js
 * Output: scripts/output/practiceExams_english_export.json
 */
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

const keyCandidates = [
  path.join(__dirname, '..', 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'ultrasat-5e4c4-369f564bdaef.json'),
  path.join(__dirname, 'serviceAccountKey.json')
];
const keyPath = keyCandidates.find(p => fs.existsSync(p));
if (!keyPath) {
  console.error('Service account key not found.');
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require(keyPath)) });
const db = admin.firestore();

async function fetchQuestion(qid) {
  const snap = await db.collection('questions').doc(qid).get();
  return snap.exists ? { id: qid, ...snap.data() } : { id: qid, __MISSING__: true };
}

(async () => {
  const out = { exportedAt: new Date().toISOString(), exams: [] };
  const examSnap = await db.collection('practiceExams').get();
  console.log(`Found ${examSnap.docs.length} practice exams`);

  for (const examDoc of examSnap.docs) {
    const exam = examDoc.data();
    const examEntry = {
      id: examDoc.id,
      title: exam.title || null,
      description: exam.description || null,
      isPublic: exam.isPublic ?? null,
      examNumber: exam.examNumber ?? null,
      moduleIds: exam.moduleIds || [],
      modules: []
    };

    const moduleIds = exam.moduleIds || [];
    for (let i = 0; i < moduleIds.length; i++) {
      const mSnap = await db.collection('examModules').doc(moduleIds[i]).get();
      if (!mSnap.exists) {
        examEntry.modules.push({ id: moduleIds[i], __MISSING__: true, positionInExam: i + 1 });
        continue;
      }
      const m = mSnap.data();
      const modEntry = {
        id: mSnap.id,
        positionInExam: i + 1,
        title: m.title || null,
        moduleNumber: m.moduleNumber ?? null,
        timeLimit: m.timeLimit ?? null,
        calculatorAllowed: m.calculatorAllowed ?? null,
        questionCount: (m.questionIds || []).length,
        questionIds: m.questionIds || []
      };
      // Export full question content for English modules (moduleNumber 1 & 2) at ANY position
      const isEnglish = m.moduleNumber === 1 || m.moduleNumber === 2;
      if (isEnglish) {
        modEntry.questions = [];
        for (const qid of (m.questionIds || [])) {
          modEntry.questions.push(await fetchQuestion(qid));
        }
      }
      examEntry.modules.push(modEntry);
    }
    out.exams.push(examEntry);
    console.log(`Exported: ${examEntry.title} (${examEntry.modules.length} modules)`);
  }

  const outDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'practiceExams_english_export.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote ${outPath}`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
