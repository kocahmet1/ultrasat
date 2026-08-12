import json,glob,re,sys,collections
M={s['id']:s for s in json.load(open('manifest.json'))}
L='ABCD'
issues=[];seen={}
items=[]
for f in sorted(glob.glob('src/*.json')):
    for it in json.load(open(f)):
        it['_f']=f; items.append(it)
for it in items:
    i=it['id']; a=M.get(i)
    if not a: issues.append((i,'not in manifest')); continue
    if i in seen: issues.append((i,'duplicate id'))
    seen[i]=1
    k=it['key']
    if not isinstance(k,int) or not 0<=k<4: issues.append((i,'bad key index',k)); continue
    if L[k]!=a['key']: issues.append((i,'KEY MISMATCH','file='+L[k],'manifest='+a['key']))
    for fld,val in [('difficulty',a['difficulty']),('subtype',a['subtype']),('family',a['family']),('polarity',a['polarity'])]:
        if it.get(fld)!=val: issues.append((i,'meta '+fld,it.get(fld),val))
    if len(it.get('options',[]))!=4: issues.append((i,'not 4 options'))
    if len(set(it.get('options',[])))!=4: issues.append((i,'duplicate options'))
    exp=set(L)-{L[k]}
    if set(it.get('rebuttals',{}))!=exp: issues.append((i,'rebuttal letters',sorted(it.get('rebuttals',{})),sorted(exp)))
    w=it.get('why','')
    if not w.startswith('Choice '+L[k]+' is the best answer'): issues.append((i,'why opener',w[:32]))
    for L2 in exp:
        r=it['rebuttals'][L2]
        if not r or len(r.split())<8: issues.append((i,'thin rebuttal '+L2))
    if it['family']=='quant' and 'figure' not in it: issues.append((i,'missing figure'))
    if it.get('figure',{}).get('kind')=='table':
        fg=it['figure']
        if len(fg['rows'])>5: issues.append((i,'table >5 rows'))
        if len(fg['columns'])>5: issues.append((i,'table >5 cols'))
        if any(len(r)!=len(fg['columns']) for r in fg['rows']): issues.append((i,'ragged table'))
    if it.get('figure',{}).get('kind') in ('bar','grouped-bar','line'):
        fg=it['figure']
        if len(fg['series'])>4: issues.append((i,'>4 series'))
        if any(len(s['values'])!=len(fg['categories']) for s in fg['series']): issues.append((i,'series/category length'))
def wc(s): return len(re.findall(r"[A-Za-z0-9’'\-%$.,]+", re.sub('<[^>]+>',' ',s)))
print('items:',len(items),' unique:',len(seen))
print('ISSUES:',len(issues))
for x in issues: print('  ',x)
if items:
    print('\nkey spread:',collections.Counter(L[i['key']] for i in items))
    print('by diff:',collections.Counter(i['difficulty'] for i in items))
    for fam in ['quant','finding','quote']:
        for d in ['easy','medium','hard']:
            v=[wc(i['passage']) for i in items if i['family']==fam and i['difficulty']==d]
            o=[wc(x) for i in items if i['family']==fam and i['difficulty']==d for x in i['options']]
            if v: print(f'  {fam:8s}{d:7s} n={len(v):3d} passage mean={sum(v)/len(v):5.1f} option mean={sum(o)/len(o):5.1f}')

# ---- spec-conformance checks ----
import collections as C
S=json.load(open('manifest.json'))
print('\n== composition vs spec ==')
print(' family x diff:',dict(C.Counter((i['difficulty'],i['family'],i['subtype']) for i in items)))
print(' quant stems  :',dict(C.Counter(i.get('stemType') for i in items if i['family']=='quant')))
print(' polarity     :',dict(C.Counter(i['polarity'] for i in items)),' (spec: 5 weaken)')
print(' weaken ids   :',[i['id'] for i in items if i['polarity']=='weaken'])
print(' lanes        :',dict(C.Counter(i['lane'] for i in items)))
print(' hard quant relation (no lookups allowed):',dict(C.Counter(i.get('relation') for i in items if i['family']=='quant' and i['difficulty']=='hard')))
print(' easy quant options <=5 words:',sum(1 for i in items if i['family']=='quant' and i['difficulty']=='easy' and max(wc(o) for o in i['options'])<=5),'/19 (spec >=14)')
print(' compound quote claims:',sum(1 for i in items if i.get('compound')),'(spec >=9)')
print(' blank-ending passages:',sum(1 for i in items if '______' in i['passage']))
print(' underlined claims:',sum(1 for i in items if '<u>' in i['passage']))
print(' graphs rendered:',sum(1 for i in items if i.get('graphUrl')),' tables:',sum(1 for i in items if i.get('figure',{}).get('kind')=='table'))
# no 3 consecutive same key in emitted order
seq=[L[i['key']] for i in sorted(items,key=lambda x:x['id'])]
run=[i for i in range(len(seq)-2) if seq[i]==seq[i+1]==seq[i+2]]
print(' 3-in-a-row key runs:',len(run))
# avoid_terms collision
av=set(x.strip() for x in open('avoid_terms.txt') if len(x.strip())>4)
hits=C.Counter()
for it in items:
    blob=' '.join([it['passage'],it['stem']]+it['options'])
    for t in av:
        if t in blob: hits[t]+=1
generic={'According','Percentage','Estimated','Average','Number','Study','Level','Species','Characteristics','Properties','Approximate','Change','Effect','Museum','Native'}
real={k:v for k,v in hits.items() if k not in generic and ' ' in k or (k not in generic and len(k)>7)}
print(' avoid_terms collisions:',dict(sorted(real.items(),key=lambda x:-x[1])[:15]) or 'none')
