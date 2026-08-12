#!/usr/bin/env python3
"""
QC validator for the Inferences (INF) refresh set.

Checks every authored item against the measured bands in INF_STYLE_SPEC.md and
reports set-level balance. Run from this directory:

    python3 validate.py            # summary + errors
    python3 validate.py -v         # also list every item's numbers
"""
import json, re, sys, glob, os, statistics as st
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'src')
STEM = "Which choice most logically completes the text?"

# --- measured bands from the 140-item official export -------------------------
BANDS = {
    'easy':   dict(stim=(66, 120), sent=(4, 7), opt=(7, 20), optmean=(10.0, 17.5)),
    'medium': dict(stim=(75, 125), sent=(3, 5), opt=(8, 24), optmean=(11.0, 19.0)),
    'hard':   dict(stim=(85, 133), sent=(3, 5), opt=(12, 33), optmean=(15.0, 25.0)),
}
MAX_OPT_RATIO = 1.9
# mirrors the hedge list measured in INF_STYLE_SPEC.md §2 (bare "can" is excluded:
# "can affect" is ordinary modal phrasing in CB keys, not a scope hedge)
HEDGE = re.compile(r"\b(may|might|could|likely|some|at least|tends? to|tended to|often|generally|"
                   r"not necessarily|relatively|partly|in part|somewhat|probably|can be)\b", re.I)
HOW_OFTEN = re.compile(r"how often", re.I)
ABSOLUTE = re.compile(r"\b(all|always|never|none|only|every|must|proves?|entirely|completely)\b", re.I)
# a NEGATIVE/LIMITING key = the conclusion itself denies, restricts, or contrasts-away a claim
NEGKEY = re.compile(r"(\bcannot\b|\bcan't\b|\bnever\b|\bno (role|basis|effect|evidence|part|relation)\b|"
                    r"\bfail(s|ed|ing)?\b|\bcaution\b|\bunlikely\b|\bcasts? doubt\b|\brather than\b|"
                    r"\bother than\b|\bdoes not\b|\bdid not\b|\bis not\b|\bare not\b|\bdo not\b|"
                    r"\bwere not\b|\bwas not\b|\binstead of\b|, not )", re.I)
SUBORD = re.compile(r"^(although|while|though|because|since|rather than|contrary to|despite|"
                    r"given that|even though|if|whereas|unlike|in contrast)\b", re.I)

def hedged(t):
    """True if t hedges. 'how often' is a measurement phrase, not a hedge."""
    return bool(HEDGE.search(HOW_OFTEN.sub("how frequently", t)))

def wc(s):
    return len(re.findall(r"[A-Za-z0-9'’-]+", s))

def sentences(s):
    s = re.sub(r'_{3,}\s*$', '', s).strip()
    return len(re.findall(r'[.!?]["”)]?\s+(?=[A-Z"“])', s)) + 1

def load():
    items = []
    for f in sorted(glob.glob(os.path.join(SRC, '*.json'))):
        with open(f, encoding='utf-8') as fh:
            for it in json.load(fh):
                it['_file'] = os.path.basename(f)
                items.append(it)
    return items

def main():
    verbose = '-v' in sys.argv
    items = load()
    errors, warnings = [], []
    seen_ids, seen_topics = set(), []

    for it in items:
        iid = it.get('id', '?')
        def err(m): errors.append(f"{iid}: {m}")
        def warn(m): warnings.append(f"{iid}: {m}")

        # --- required fields
        for fld in ('id', 'difficulty', 'passage', 'options', 'key', 'keyLetter',
                    'why', 'rebuttals', 'families', 'remember', 'topic', 'lane', 'leadIn'):
            if fld not in it:
                err(f"missing field '{fld}'");
        if 'options' not in it or 'key' not in it:
            continue

        if iid in seen_ids: err("duplicate id")
        seen_ids.add(iid)

        d = it['difficulty']
        if d not in BANDS: err(f"bad difficulty {d!r}"); continue
        b = BANDS[d]

        p = it['passage']
        # --- blank
        if not p.rstrip().endswith('______'):
            err("passage must end with exactly six underscores")
        if p.count('______') != 1:
            err(f"passage contains {p.count('______')} blanks; must be exactly 1")
        if re.search(r'_{7,}', p):
            err("blank has more than six underscores")

        # --- stem must NOT be embedded in the passage (it is added at export time)
        if STEM.lower() in p.lower():
            err("stem must not be inside the passage field")

        # --- lengths
        n = wc(p)
        if not (b['stim'][0] <= n <= b['stim'][1]):
            err(f"stimulus {n} words, outside {b['stim']} for {d}")
        ns = sentences(p)
        if not (b['sent'][0] <= ns <= b['sent'][1]):
            warn(f"{ns} sentences, outside {b['sent']} for {d}")

        opts = it['options']
        if len(opts) != 4: err(f"{len(opts)} options; must be 4")
        ol = [wc(o) for o in opts]
        for i, (o, l) in enumerate(zip(opts, ol)):
            if not o.rstrip().endswith('.'):
                err(f"option {'ABCD'[i]} must end with a period")
            # options continue a sentence, so a leading capital is only OK on a proper noun/adjective
            if o[0].isupper() and not re.match(r"^[A-Z][a-zà-öø-ÿ]+(ish|ese|ian|ean|an|n)?\b\s", o):
                warn(f"option {'ABCD'[i]} starts with a capital letter")
            if not (b['opt'][0] <= l <= b['opt'][1]):
                err(f"option {'ABCD'[i]} is {l} words, outside {b['opt']} for {d}")
        if ol and max(ol) / max(1, min(ol)) > MAX_OPT_RATIO:
            err(f"option length ratio {max(ol)/min(ol):.2f} > {MAX_OPT_RATIO} ({ol})")
        if ol and (b['optmean'][0] <= st.mean(ol) <= b['optmean'][1]) is False:
            warn(f"option mean {st.mean(ol):.1f} outside {b['optmean']} for {d}")

        # --- key / letters
        k = it['key']
        if not isinstance(k, int) or not 0 <= k <= 3:
            err("key must be an int 0-3")
        elif 'ABCD'[k] != it.get('keyLetter'):
            err(f"keyLetter {it.get('keyLetter')} != key index {k}")

        # --- rebuttals & families cover exactly the three distractors
        want = {L for i, L in enumerate('ABCD') if i != k}
        if set(it.get('rebuttals', {})) != want:
            err(f"rebuttals cover {sorted(it.get('rebuttals', {}))}, need {sorted(want)}")
        if set(it.get('families', {})) != want:
            err(f"families cover {sorted(it.get('families', {}))}, need {sorted(want)}")
        for L, r in it.get('rebuttals', {}).items():
            if not r.startswith(f"Choice {L} is incorrect"):
                err(f"rebuttal {L} must start 'Choice {L} is incorrect'")
            if re.search(r'\b(less precise|not the best|better answer|but .{0,12} is better)\b', r, re.I):
                err(f"rebuttal {L} uses a degrees-of-correctness reason")
        okfam = {'unmentioned', 'polarity', 'excluded', 'half-right', 'scope', 'wrong-element', 'contradicted'}
        for L, f in it.get('families', {}).items():
            if f not in okfam: err(f"family {L}={f!r} not in {sorted(okfam)}")
        if d in ('medium', 'hard'):
            fams = list(it.get('families', {}).values())
            if len(set(fams)) < 2:
                err(f"all three distractors share family {fams[0]!r}")

        # --- rationale
        why = it.get('why', '')
        if not why.startswith(f"Choice {it.get('keyLetter')} is the best answer."):
            err("'why' must open 'Choice X is the best answer.'")
        if wc(why) < 45: warn(f"'why' only {wc(why)} words")

        # --- ladder rules
        keytext = opts[k] if 0 <= k <= 3 else ''
        if d == 'easy':
            if NEGKEY.search(keytext):
                err("easy items must not have a negative/limiting key (0/20 official)")
            if any(SUBORD.match(o.strip()) for o in opts):
                err("easy options must not open with a subordinating conjunction (0% official)")
            if sum(o.count(',') for o in opts) > 2:
                warn("easy options carry more commas than the official easy mean (0.07/option)")
        if d == 'hard':
            if not it.get('eliminative'):
                err("hard items require an 'eliminative' field quoting the passage's exclusion clause")
            elif it['eliminative'] not in p:
                err("'eliminative' text does not appear verbatim in the passage")

        # --- hedge must not be a scannable tell
        if hedged(keytext) and not any(hedged(o) for i, o in enumerate(opts) if i != k):
            warn("key hedges and no distractor does — hedging is scannable here")
        # --- neither may negation/contrast be a scannable tell
        if NEGKEY.search(keytext) and not any(NEGKEY.search(o) for i, o in enumerate(opts) if i != k):
            warn("key negates/contrasts and no distractor does — the negation is scannable here")

        seen_topics.append((iid, it.get('topic', '')))

        if verbose:
            print(f"{iid} {d:6} stim={n:3}w sents={ns} opts={ol} ratio={max(ol)/min(ol):.2f} key={it['keyLetter']}")

    # ---------------- set-level balance ----------------
    print("\n" + "=" * 62)
    print("SET-LEVEL BALANCE")
    print("=" * 62)
    byd = Counter(i['difficulty'] for i in items)
    print(f"counts: {dict(byd)}  total={len(items)}")
    for d in ('easy', 'medium', 'hard'):
        s = [i for i in items if i['difficulty'] == d]
        if not s: continue
        kl = Counter(i['keyLetter'] for i in s)
        stims = [wc(i['passage']) for i in s]
        optw = [wc(o) for i in s for o in i['options']]
        neg = sum(1 for i in s if NEGKEY.search(i['options'][i['key']]))
        kh = sum(1 for i in s if hedged(i['options'][i['key']]))
        longest = sum(1 for i in s
                      if [wc(o) for o in i['options']].index(max(wc(o) for o in i['options'])) == i['key'])
        print(f"\n{d.upper():6} n={len(s)}")
        print(f"  key letters      {dict(sorted(kl.items()))}")
        print(f"  stimulus words   mean={st.mean(stims):.1f} min={min(stims)} max={max(stims)}")
        print(f"  option words     mean={st.mean(optw):.1f} min={min(optw)} max={max(optw)}")
        print(f"  key is longest   {longest}/{len(s)} = {longest/len(s)*100:.0f}%  (official 19%, chance 25%)")
        print(f"  negative key     {neg}/{len(s)} = {neg/len(s)*100:.0f}%  (official easy 0% / med 25% / hard 28%)")
        print(f"  key hedges       {kh}/{len(s)} = {kh/len(s)*100:.0f}%  (official 37%)")
    allk = Counter(i['keyLetter'] for i in items)
    print(f"\nWHOLE SET key letters {dict(sorted(allk.items()))}")
    print(f"lanes {dict(Counter(i.get('lane') for i in items))}")
    fam = Counter(f for i in items for f in i.get('families', {}).values())
    print(f"distractor families {dict(fam.most_common())}")
    leads = Counter(re.sub(r'^[A-Z][a-zà-öø-ÿ’-]+ ', '', i.get('leadIn', '')).lower() for i in items)
    print(f"distinct lead-ins {len(set(i.get('leadIn','') for i in items))}/{len(items)}")

    # --- topic collision with the official bank
    avoid_path = os.path.join(HERE, 'AVOID_NAMES_TOPICS.txt')
    if os.path.exists(avoid_path):
        avoid = [a.strip() for a in open(avoid_path, encoding='utf-8') if len(a.strip()) > 4]
        hits = [(i['id'], a) for i in items for a in avoid if a.lower() in i['passage'].lower()]
        print(f"\ncollisions with official names/topics: {len(hits)}")
        for h in hits[:20]: print("   ", h)

    print("\n" + "=" * 62)
    if warnings:
        print(f"WARNINGS ({len(warnings)})")
        for w in warnings: print("  ~", w)
    print(f"\nERRORS ({len(errors)})")
    for e in errors: print("  x", e)
    print("=" * 62)
    return 1 if errors else 0

if __name__ == '__main__':
    sys.exit(main())
