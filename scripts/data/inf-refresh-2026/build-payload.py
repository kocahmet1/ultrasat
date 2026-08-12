#!/usr/bin/env python3
"""
Convert the authored INF items in src/*.json into the shape the live `questions`
collection uses, and write questions-payload.json next to this file.

Run:  python3 build-payload.py
Then: node scripts/retireAndImportInferences.js --dry-run

--no-step-rebuttals
    By default the per-choice rebuttals are ALSO appended to `steps`, because
    the currently deployed ExplanationCard renders neither the flat
    `explanation` nor a rebuttals section — the walkthrough is the only slot
    where students can see them today. Once the web app is redeployed (the
    current code shows rebuttals inline under the options and in the card),
    regenerate with this flag and re-run updateInferencesExplanations.js to
    remove the duplication.
"""
import json, glob, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
STEM = "Which choice most logically completes the text?"

SUB = dict(
    kebab="inferences",
    numericId=2,
    name="Inferences",
    domain="information-ideas",
    section="reading-writing",
)

def flat_explanation(it):
    """Legacy flat `explanation` string — the fallback ExplanationCard renders
    when explanationStructured is absent. Mirrors the official rationale shape."""
    parts = [it["why"]]
    for L in "ABCD":
        if L in it["rebuttals"]:
            parts.append(it["rebuttals"][L])
    return "\n\n".join(parts)

SENT_SPLIT = re.compile(r'(?<=[.?!])[”"]?\s+(?=[A-Z“"])')

def steps(it):
    """Walkthrough built from the item's own rationale.

    ExplanationCard renders explanationStructured and ignores the flat
    `explanation` once structured content exists, so the full reasoning must
    live here. We drop the redundant "Choice X is the best answer." opener
    (the card's status strip already names the correct answer) and serve the
    rest of the rationale as numbered steps, at most four, each substantive.
    """
    why = it["why"].strip()
    opener = f"Choice {it['keyLetter']} is the best answer."
    if why.startswith(opener):
        why = why[len(opener):].strip()

    sentences = [s.strip() for s in SENT_SPLIT.split(why) if s.strip()]
    if not sentences:
        sentences = [why]

    # First read the blank's lead-in, then walk the rationale.
    parts = [f"Read to the blank: the text ends with “{it['leadIn'].rstrip()} ______,” so the "
             f"choice must finish exactly that sentence."]
    if len(sentences) <= 3:
        parts.extend(sentences)
    else:
        parts.extend(sentences[:2])
        parts.append(" ".join(sentences[2:]))
    out = [f"Step {i}: {p}" for i, p in enumerate(parts, 1)]

    # Stopgap for the deployed card (see module docstring): surface the
    # rebuttals inside the walkthrough, verbatim, in letter order.
    if "--no-step-rebuttals" not in sys.argv:
        for L in "ABCD":
            if L in it["rebuttals"]:
                out.append(it["rebuttals"][L])
    return out

def build(it):
    return {
        "text": it["passage"].strip() + "\n\n" + STEM,
        "questionType": "multiple-choice",
        "options": it["options"],
        "correctAnswer": str(it["key"]),
        "acceptedAnswers": None,
        "inputType": "number",
        "answerFormat": None,
        "explanation": flat_explanation(it),
        "explanationStructured": {
            "rule": ("An inference question is complete only when the choice is the conclusion the "
                     "passage's premises force — not merely one they allow."),
            "steps": steps(it),
            "choiceRebuttals": dict(it["rebuttals"]),
            "thingsToRemember": [it["remember"]],
        },
        "difficulty": it["difficulty"],
        "subcategory": SUB["kebab"],
        "subCategory": SUB["kebab"],
        "subcategoryId": SUB["numericId"],
        "categoryPath": f"{SUB['section']}/{SUB['domain']}/{SUB['name']}",
        "mainCategory": SUB["domain"],
        "subjectArea": SUB["section"],
        "source": "ultrasat-original",
        "usageContext": "general",
        "authoringSet": "inf-refresh-2026",
        "authoringId": it["id"],
        "hasImage": False,
        "graphUrl": None,
        "graphDescription": None,
        "passage": None,
        "skillTags": [],
    }

def main():
    items = []
    for f in sorted(glob.glob(os.path.join(HERE, "src", "*.json"))):
        items.extend(json.load(open(f, encoding="utf-8")))
    if len(items) != 100:
        print(f"WARNING: {len(items)} items, expected 100", file=sys.stderr)

    docs = [build(i) for i in items]

    # sanity: the key index must point at the intended option text
    for it, d in zip(items, docs):
        assert d["options"][int(d["correctAnswer"])] == it["options"][it["key"]], it["id"]
        assert d["text"].count("______") == 1, it["id"]
        assert d["text"].endswith(STEM), it["id"]

    out = os.path.join(HERE, "questions-payload.json")
    json.dump(docs, open(out, "w", encoding="utf-8"), indent=1, ensure_ascii=False)

    from collections import Counter
    print(f"wrote {len(docs)} docs -> {out}")
    print("  difficulty:", dict(Counter(d["difficulty"] for d in docs)))
    print("  answer key:", dict(sorted(Counter("ABCD"[int(d['correctAnswer'])] for d in docs).items())))
    print("  subcategory:", docs[0]["subcategory"], "| subcategoryId:", docs[0]["subcategoryId"],
          "| usageContext:", docs[0]["usageContext"])

if __name__ == "__main__":
    main()
