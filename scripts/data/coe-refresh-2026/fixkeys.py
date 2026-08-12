import json,glob,re,sys
L='ABCD'
M={s['id']:s for s in json.load(open('manifest.json'))}
files=sys.argv[1:] or sorted(glob.glob('src/*.json'))
for f in files:
    d=json.load(open(f)); ch=0
    for it in d:
        t=L.index(M[it['id']]['key']); k=it['key']
        if k==t: continue
        pairs=[[o, it['rebuttals'].get(L[i])] for i,o in enumerate(it['options'])]
        pairs[k],pairs[t]=pairs[t],pairs[k]
        it['options']=[p[0] for p in pairs]
        it['rebuttals']={L[i]:p[1] for i,p in enumerate(pairs) if i!=t}
        assert all(v for v in it['rebuttals'].values()), it['id']
        it['key']=t
        it['why']=re.sub(r'^Choice [A-D] is the best answer','Choice %s is the best answer'%L[t],it['why'])
        ch+=1
    json.dump(d,open(f,'w'),indent=1,ensure_ascii=False)
    print(f,'repositioned',ch)
