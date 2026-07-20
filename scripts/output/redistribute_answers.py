import json,re
p=json.load(open('qc_payload_exam2_m1.json'))
Q=p['questions']
# balanced, non-obvious target positions (A=7,B=7,C=6,D=7)
targets=[2,0,3,1,2,1,0,3,1,0,2,3,0,2,1,3,0,1,3,2,1,0,2,3,1,0,3]
assert len(targets)==len(Q)
LET="ABCD"

def remap_expl(expl, old2new):
    # Replace choice-letter tokens only in recognized contexts, single pass.
    def rep(m):
        pre,letter=m.group(1),m.group(2)
        return pre+old2new[letter]
    # contexts: "Choice X", "Choices X", "is X" (as in 'Correct is X'), "(X)"
    expl=re.sub(r'(Choice[s]? )([ABCD])\b', rep, expl)
    expl=re.sub(r'(is )([ABCD])(?=[.\s])', rep, expl)
    expl=re.sub(r'(\()([ABCD])(?=\))', rep, expl)
    return expl

for i,q in enumerate(Q):
    oc=q['correctAnswer']; tgt=targets[i]
    opts=q['options']
    others=[j for j in range(4) if j!=oc]
    order=[]; it=iter(others)
    for pos in range(4):
        order.append(oc if pos==tgt else next(it))
    q['options']=[opts[k] for k in order]
    q['correctAnswer']=tgt
    old2new={LET[k]:LET[newpos] for newpos,k in enumerate(order)}
    q['explanation']=remap_expl(q['explanation'], old2new)

json.dump(p,open('qc_payload_exam2_m1.json','w'),ensure_ascii=False,indent=1)
import collections
print("new correct positions:",dict(collections.Counter(q['correctAnswer'] for q in Q)))
