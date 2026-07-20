# Builds Stage-2 QC payload for Exam 2, R&W Module 2. Emits qc_payload_exam2_m2.json
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
d = json.load(open(os.path.join(HERE, 'practiceExams_english_export.json')))
e2 = [x for x in d['exams'] if x['title'] == 'Exam 2'][0]
mod2 = e2['modules'][2]                    # R&W Module 2 (position 3)
byidx = {i + 1: q for i, q in enumerate(mod2['questions'])}

def q(text, options, correct, expl, sub, subid, diff, graph=None, gdesc=None):
    return {"text": text, "options": options, "correctAnswer": correct,
            "explanation": expl, "difficulty": diff,
            "subcategory": sub, "subCategory": sub, "subcategoryId": subid,
            "source": "import", "usageContext": "exam", "skillTags": [],
            "graphUrl": graph, "graphDescription": gdesc, "passage": None}

updates = {}   # full-document replacements (set merge)
partial = {}   # field-level patches

# --- Q16: broken (dup options B==C, wrong key, dup of Exam 1). Full replacement. ---
updates["qHZRxYFuVy8MaPtFGHh7"] = q(
 "The museum's newest exhibit highlights several ______ contributions to marine biology, including "
 "their pioneering methods for tagging and tracking deep-sea fish.\n\n"
 "Which choice completes the text so that it conforms to the conventions of Standard English?",
 ["researchers'", "researcher's", "researchers", "researchers's"],
 0,
 "Step 1: The contributions belong to more than one person—'several ... researchers,' later referred to as "
 "'their'—so a plural possessive is required.\n"
 "Step 2: The plural possessive of 'researcher' is 'researchers'' (plural + apostrophe). Correct is A.\n"
 "Choice B ('researcher's') is singular possessive and conflicts with 'several' and 'their.'\n"
 "Choice C ('researchers') is a plain plural with no possessive, but the noun must show possession of 'contributions.'\n"
 "Choice D ('researchers's') is not a standard English form.",
 "form-structure-sense", 10, "medium")

# --- Q20: re-key from 'counteracts' (C) to 'counteracting' (D); text/options unchanged. ---
partial["JjTH4NE5Pgd7h5H2Uaah"] = {
 "correctAnswer": 3,
 "explanation": (
  "Step 1: The sentence already has a main verb—'offers' ('Such a compensatory measure ... offers an "
  "evolutionary explanation of mitochondrial reproduction'). The blank cannot supply a second main verb.\n"
  "Step 2: Only the participle 'counteracting' works: 'counteracting the organelle's decline' becomes a "
  "modifying phrase describing the measure, leaving 'offers' as the single main verb. Correct is D.\n"
  "Choices A ('had counteracted'), B ('counteracted'), and C ('counteracts') are all finite verbs; each "
  "would create two main verbs joined by nothing but a comma (a run-on).")
}

# --- Q17: fix typos 'Kizonba'->'Kizomba' (x2) and 'India dance duo'->'Indian dance duo'. Text only. ---
t17 = byidx[17]['text']
t17_fixed = t17.replace("Kizonba", "Kizomba").replace("the India dance duo", "the Indian dance duo")
assert "Kizonba" not in t17_fixed and "the India dance duo" not in t17_fixed
partial["r9I9dr6zmb3vbt2aY1Wd"] = {"text": t17_fixed}

# --- Q23: fix 'Linmocharis fava'->'Limnocharis flava' (x2). Text only. ---
t23 = byidx[23]['text']
t23_fixed = t23.replace("Linmocharis fava", "Limnocharis flava")
assert "Linmocharis" not in t23_fixed and "fava" not in t23_fixed
partial["r3tFCcppeaRgYBBsEYqh"] = {"text": t23_fixed}

# --- Q3: fix run-on by inserting a colon after the blank ('is _____ featuring' -> 'is _____: featuring'). ---
t3 = byidx[3]['text']
t3_fixed = re.sub(r'(is _+)\s+featuring', r'\1: featuring', t3, count=1)
assert ": featuring" in t3_fixed and t3_fixed != t3
partial["EuDYIbYqH4Osk0t2z4Of"] = {"text": t3_fixed}

# --- NEW 27th question: Words in Context (Craft & Structure is light; Information is heavy). ---
# Inserted into the module's questionIds at index 3 (becomes Q4), grouping with the other WiC items.
new_question = q(
 "Marine biologist Edith Widder designed a deep-sea camera that emits only far-red light, which most "
 "deep-sea animals cannot see. This allows the camera to record the animals' natural behavior without "
 "______ them: earlier cameras, which used bright white light, tended to frighten the animals away "
 "before they could be filmed.\n\n"
 "Which choice completes the text with the most logical and precise word or phrase?",
 ["disturbing", "detecting", "resembling", "classifying"],
 0,
 "Step 1: The contrast (the colon and the clause after it) explains that older, bright-light cameras "
 "'frighten the animals away,' whereas Widder's light-free camera avoids that effect.\n"
 "Step 2: 'Disturbing' captures avoiding that frightening effect—recording without bothering the animals. Correct is A.\n"
 "Choice B ('detecting') contradicts the sentence, since filming the animals means detecting them.\n"
 "Choice C ('resembling') is illogical in context.\n"
 "Choice D ('classifying') does not fit the contrast with frightening the animals away.",
 "words-in-context", 4, "medium")

payload = {
 "examId": "vxxtBSqnVQUPsXu9Xy4B",
 "module2Id": "Goq368OvlAGDI4ghw4Jx",
 "expectedCurrentCount": 26,
 "insertIndex": 3,
 "updates": updates,
 "partial": partial,
 "append": new_question,
}
out = os.path.join(HERE, 'qc_payload_exam2_m2.json')
json.dump(payload, open(out, 'w'), ensure_ascii=False, indent=1)
print("full updates:", len(updates), "| partial:", len(partial), "| append: 1")
print("Q17 fixed  ->", t17_fixed[:90])
print("Q23 fixed  ->", t23_fixed[:90])
print("Q3  fixed  ->", t3_fixed[:90])
print("wrote", out)
