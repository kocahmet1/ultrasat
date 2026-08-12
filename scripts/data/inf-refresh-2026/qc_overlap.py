"""Originality + giveaway QC for the INF refresh set."""
import json,glob,re,os
from collections import Counter
def norm(t):
    t=t.lower().replace('’',"'")
    return re.findall(r"[a-z']+",t)
STOP=set("""a an the of to in and or is are was were be been being that this these those it its as at by for from with on
which who whom whose what when where while than then there their they them he she his her not no but if so such can could
may might will would shall should must do does did done have has had having more most less least other another same""".split())
def grams(ws,n=5): return set(tuple(ws[i:i+n]) for i in range(len(ws)-n+1))
def content(ws): return set(w for w in ws if w not in STOP and len(w)>3)

new=[]
for f in sorted(glob.glob('src/*.json')):
    for it in json.load(open(f,encoding='utf-8')): new.append(it)
old=[]
for it in json.load(open('/sessions/jolly-festive-goodall/mnt/outputs/work/inf_items.json',encoding='utf-8')):
    old.append({'id':it['id'],'text':it['stim']+' '+' '.join(it['options'])})
for it in json.load(open('/sessions/jolly-festive-goodall/mnt/ultrasat/scripts/output/pt5-build/bank.json',encoding='utf-8')):
    if it.get('skill')=='Inferences':
        old.append({'id':'bank-'+str(it.get('id')),'text':it.get('question','')})

print("="*64); print("JOB 1 — ORIGINALITY vs %d official CB Inferences items"%len(old)); print("="*64)
pairs=[]
for n in new:
    nw=norm(n['passage']+' '+' '.join(n['options'])); ng=grams(nw); nc=content(nw)
    best=(0,0,None)
    for o in old:
        ow=norm(o['text']); og=grams(ow); oc=content(ow)
        g=len(ng&og)/max(1,len(ng))
        j=len(nc&oc)/max(1,len(nc|oc))
        if j>best[1]: best=(g,j,o['id'])
    pairs.append((best[1],best[0],n['id'],best[2]))
pairs.sort(reverse=True)
print("verbatim 5-gram overlap > 0 anywhere:", sum(1 for p in pairs if p[1]>0))
print("\ntop 10 content-word similarity (Jaccard) — ceiling check:")
for j,g,nid,oid in pairs[:10]:
    print(f"  {nid:9} vs official {oid:12}  jaccard={j:.3f}  5gram={g:.3f}")
print(f"\nmedian jaccard {sorted(p[0] for p in pairs)[50]:.3f} ; max {pairs[0][0]:.3f}")
print("(For reference, two unrelated expository passages typically score 0.03-0.09.)")

print("\n"+"="*64); print("JOB 2 — GIVEAWAY CHECK (can the key be picked without the passage?)"); print("="*64)
flag=[]
for n in new:
    pw=content(norm(n['passage']))
    ov=[len(content(norm(o))&pw)/max(1,len(content(norm(o)))) for o in n['options']]
    k=n['key']
    others=[v for i,v in enumerate(ov) if i!=k]
    if ov[k]>max(others)+0.34: flag.append((n['id'],round(ov[k],2),[round(x,2) for x in ov]))
print("items where the key shares far more topic vocabulary with the passage than any distractor:")
for f in flag: print("  ",f)
if not flag: print("   none — distractors are drawn from the passage's own vocabulary field")

print("\n"+"="*64); print("JOB 3 — INTERNAL CONSISTENCY"); print("="*64)
bad=[]
for n in new:
    # rebuttal must not quote a phrase absent from its own option or the passage
    for L,r in n['rebuttals'].items():
        i='ABCD'.index(L)
        for q in re.findall(r'"([^"]{6,60})"',r):
            if q.lower() not in (n['passage']+' '+n['options'][i]).lower():
                bad.append((n['id'],L,'quote not found: '+q))
    if n.get('eliminative') and n['eliminative'] not in n['passage']:
        bad.append((n['id'],'-','eliminative not verbatim'))
    # the passage must not already contain the keyed conclusion verbatim
    kw=content(norm(n['options'][n['key']]))
    if kw and len(kw & content(norm(n['passage'])))/len(kw) > 0.9:
        bad.append((n['id'],'-','key is a near-verbatim restatement of the passage'))
print(bad if bad else "  no issues")

print("\n"+"="*64); print("JOB 4 — DUPLICATE TOPICS / NAMES INSIDE THE NEW SET"); print("="*64)
names=Counter()
for n in new:
    for m in re.finditer(r'\b[A-ZÀ-Þ][a-zà-öø-ÿ]+ [A-ZÀ-Þ][a-zà-öø-ÿ]+(?:-[A-ZÀ-Þ][a-zà-öø-ÿ]+)?\b', n['passage']):
        names[m.group(0)]+=1
dupes={k:v for k,v in names.items() if v>1}
print("repeated proper names:", dupes if dupes else "none")
topics=Counter(n['topic'] for n in new)
print("repeated topics:", {k:v for k,v in topics.items() if v>1} or "none")
