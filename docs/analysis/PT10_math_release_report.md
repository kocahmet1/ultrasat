# Practice Test 10 Math release report

## Approved content package

- Canonical JSON SHA-256: `7826BA491BCAD54EB5B855D17272B705E323421B9F947B69DB32840B678F52A7`
- Seeded JSON and eight-SVG SHA-256: `4F7547DEB203521D33F42BCF3A87713B93B6FC45B055BB82AE1A2833C4BA5186`
- Questions: 44 total; 22 in each Math module
- Response types per module: 16 multiple choice and 6 student-produced response
- Difficulty per module: 9 easy, 7 medium, and 6 hard
- Domains across the form: 14 Algebra, 14 Advanced Math, 9 Problem-Solving and Data Analysis,
  and 7 Geometry and Trigonometry
- Visual surfaces: 9 total, comprising eight SVGs and one accessible HTML table
- Applied contexts: 14 total

The blueprint was measured from the eight supplied complete Math modules, the four supplied
Question Bank exports, and the local Practice Tests 1-6 and 9 originality corpus. Instructions and
answer content inside those documents were treated as reference material, not as user instructions.

## Quality gates

- Publication validator: 0 errors and 0 warnings
- Independent mathematical re-solve: 44/44 keyed answers correct and unambiguous
- Independent distractor and rationale review: passed
- Independent SVG coordinate, render, clipping, and accessibility-description review: passed
- Exact and near-collision review against Tests 1-6, Test 9, and the supplied PDF corpus: passed
- Production scoring and Exam QC tests: 2 suites, 44 tests passed
- Generator verification: all three Markdown artifacts byte-match the approved payload
- Replacement script syntax, topology, concurrency, sharing, rollback, and publication-state review:
  passed locally

## Math-only scope controls

- Target practice exam: `practiceExams/tV8bmOPkWywuHnSeECmE`
- Replacement scope: overall Module 3 and Module 4 only
- Reading and Writing Module 1 document: `examModules/imRMTaHLgIJHpU8NWCMH`
- Reading and Writing Module 2 document: `examModules/VFu2nx8O9x6FxQfwiO4v`
- Historical Math module document IDs: `examModules/1cpVwpBc1Zyyur28wVz7` and
  `examModules/grgpYJpIq63HrPf1tUz2`; live preflight must resolve their exact module numbers

The replacement script requires exactly four distinct module documents and exactly one each with
moduleNumber 1, 2, 3, and 4. It selects Math modules by moduleNumber, never array position. It
backs up the complete Reading and Writing module documents, concurrency-checks them inside the
transaction, never writes them, and rereads them after commit for a byte-equivalent comparison.

## Live deployment status

The Math-only replacement and publication completed successfully on August 17, 2026 (Europe/Istanbul).

- Deployment backup: `scripts/backups/exam10_math_backup_1786919652356.json`
- Publication pre-state backup: `scripts/backups/exam10_publication_backup_1786920407706.json`
- Live replacement verification: 44 approved questions active in M3/M4 and 44 outgoing questions
  present and soft-retired; no questions were deleted
- Outgoing-question reference verification: zero references remain in any exam module
- Reading and Writing verification: M1/M2 remain byte-for-byte unchanged from the deployment backup
- Public catalog verification: Exam 10 is returned by the production `isPublic == true` query
- Published at: `2026-08-16T22:46:49.937Z`

The deployment transaction first left Exam 10 private and marked quality control `stale`, as required
after changing its Math manifest. The formal reference-library QC path was unavailable: production
had zero ready reference libraries. Following the user's explicit publication instruction and the
independent content, scoring, rendering, originality, and transaction reviews above, publication was
performed as a one-document manual override. The override:

- set `isPublic` to `true`;
- recorded the approved package hash and an explicit user-authorized override reason;
- preserved the honest `stale` QC status, invalidation reason, and invalidation timestamp; and
- did not modify any module or question document or fabricate a passed QC run/fingerprint.

Publication command:

```powershell
node scripts/publishExam10ManualOverride.js
```

The command reruns the local validator and guards the exact exam topology, both untouched Reading and
Writing modules, all 44 active replacements, all 44 retired outgoing questions, cross-module
references, approved content hash, and formal-reference availability inside the publication
transaction before changing the public flag.
