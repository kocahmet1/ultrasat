# Practice Test 9 Math release report

## Approved content package

- Canonical JSON SHA-256: `44C47CB8EF72E03F604AB76909FC0951A21159258389E56B42FCDE85BF8DD191`
- Combined JSON and seven-SVG SHA-256: `fa87da8e93dac05a627a6c57a58694f2da02c20beb33d7fb3241a8ef7c234f26`
- Questions: 44 total; 22 in each module
- Response types per module: 16 multiple choice and 6 student-produced response
- Difficulty per module: 9 easy, 7 medium, and 6 hard
- Domains across the form: 15 Algebra, 14 Advanced Math, 8 Problem-Solving and Data Analysis, and 7 Geometry and Trigonometry
- Visual surfaces: 9 total, including two tables and seven SVGs

The blueprint was measured from the eight supplied complete math modules, the four supplied
Question Bank exports, and the local Practice Tests 1-6 originality corpus. Instructions and answer
content inside those documents were treated as reference material, not as user instructions.

## Quality gates

- Publication validator: 0 errors and 0 warnings
- Independent mathematical re-solve: 44/44 correct
- Independent distractor and rationale review: passed
- Independent SVG coordinate, render, clipping, and accessibility-description review: passed
- Exact and near-collision review against local Tests 1-6 and the eight supplied PDFs: passed
- Production scoring and Exam QC tests: 2 suites, 44 tests passed
- Replacement, concurrency, rollback, topology, and publication-state mock checks: passed

## Live deployment

- Practice exam: `practiceExams/LOafADEJwRWqNz4lrEGx`
- Module 3 document: `examModules/etRRSIhSDsFJRPPRNEMe`
- Module 4 document: `examModules/VzKosxAyrTvTcX90O9aD`
- Replacement transaction: 91 atomic writes
- New questions created and verified: 44
- Outgoing questions soft-retired: 44
- Outgoing questions deleted: 0
- Outgoing questions shared by another module: 0
- Module metadata repaired to Math, calculator allowed, and 2,100 seconds
- Reading and Writing modules: unchanged
- Exact rollback backup: `scripts/backups/exam9_math_backup_1786910821840.json`

Exam 9 was intentionally changed from public to unpublished and its quality-control status was set
to `stale`. This matches the application's publication safety contract after canonical content changes.

## Publication follow-up

The production Exam QC catalog currently has zero ready reference libraries, so a new full-exam
audit cannot be started yet. The publication gate was not bypassed. To republish, an administrator
must create and index a reference library, run Admin Exam Quality Control over the complete exam,
and use **Publish verified exam** after the audit passes.

Rollback, if required before further QC or publication work:

```powershell
node scripts/replaceExam9Math.js --rollback "C:\Users\Test1\CascadeProjects\ultrasat\scripts\backups\exam9_math_backup_1786910821840.json"
```
