# Digital SAT — Standard English Conventions & Transitions: Reverse-Engineered Item Spec

**Corpus.** 4 College Board question-bank exports (1,200 items parsed, of which **150 Boundaries + 150 Form, Structure, and Sense + 157 Transitions** = 457 in-scope items, each with CB's official skill tag, difficulty tag, keyed answer, and full four-choice rationale) plus 4 released digital practice tests (Tests 2–5; 72 items recovered from the two-column PDFs, 50 of them matched back to bank IDs so that real *form-level* composition could be measured).

All counts below are from that corpus. Rule labels were assigned by parsing CB's own rationale language ("The convention being tested is …", "Choice X is incorrect because it results in a comma splice", etc.), then cross-checked against a punctuation-shape signature computed for every one of the 600 Boundaries answer choices.


---


## A. BOUNDARIES — rule taxonomy, distribution, distractor architecture

### A.1 Taxonomy with counts and difficulty

| Rule | n | share | difficulty (E/M/H) | typical module position* |
|---|---|---|---|---|
| **B03 supplementary element w/ paired marks** | 40 | 27% | E7 / M15 / H18 | q21–q28 (mid-to-late) |
| **B01 clause boundary: 2 main clauses (semicolon / period / comma+conj)** | 39 | 26% | E9 / M10 / H20 | q21–q27 (mid-to-late conventions block) |
| **B07 no punctuation inside a clause** | 21 | 14% | E12 / M4 / H5 | q18–q22 (early) |
| **B11 end punctuation: declarative period vs question mark** | 12 | 8% | E12 / M0 / H0 | q18–q20 (earliest) |
| **B04 restrictive/integrated modifier (no punctuation)** | 10 | 7% | E2 / M2 / H6 | q25–q28 (late) |
| **B06 colon before an explanation** | 8 | 5% | E0 / M0 / H8 | q25–q28 (latest) |
| **B08 semicolons in a complex series** | 6 | 4% | E0 / M1 / H5 | q23–q27 (late) |
| **B10 no punct: title + proper name** | 5 | 3% | E0 / M0 / H5 | q26–q28 (late) |
| **B12 comma after intro subordinate/participial phrase** | 4 | 3% | E2 / M1 / H1 | q19–q23 (early-mid) |
| **B09 commas in a simple series** | 3 | 2% | E3 / M0 / H0 | q18–q21 (early) |
| **B05 colon before a list** | 2 | 1% | E0 / M2 / H0 | q22–q25 (mid) |


\* Position inferred from the 4 released practice tests: the **Standard English Conventions block occupies roughly q18–q28 of a 33-question RW module**, with a hard difficulty ramp — matched items at q18–q22 were Easy 16/19 times, q23–q28 were Medium-or-Hard 11/13 times. Boundaries and Form/Structure/Sense items are **interleaved**, not blocked.


### A.2 Keyed punctuation shape by rule (what the right answer physically looks like)

| Rule | n | keyed shapes |
|---|---|---|
| B03 supplementary element w/ paired marks | 40 | `COMMA`×17, `DASH`×8, `COMMA+SEMI`×3, `PAIRED_COMMA`×3, `OPAREN+CPAREN+COMMA`×2 |
| B01 clause boundary: 2 main clauses (semicolon / period / comma+conj) | 39 | `PERIOD`×13, `COMMA&CONJ`×11, `SEMI`×5, `SEMI+COMMA`×4, `COMMA`×2 |
| B07 no punctuation inside a clause | 21 | `NONE`×20, `COMMA`×1 |
| B11 end punctuation: declarative period vs question mark | 12 | `PERIOD`×7, `QMARK`×5 |
| B04 restrictive/integrated modifier (no punctuation) | 10 | `NONE`×10 |
| B06 colon before an explanation | 8 | `COLON`×8 |
| B08 semicolons in a complex series | 6 | `SEMI`×4, `SEMI+COMMA`×1, `PERIOD`×1 |
| B10 no punct: title + proper name | 5 | `NONE`×5 |
| B12 comma after intro subordinate/participial phrase | 4 | `COMMA`×4 |
| B09 commas in a simple series | 3 | `COMMA`×1, `OPAREN+CPAREN+COMMA+OPAREN+CPAREN+COMMA`×1, `PAIRED_COMMA`×1 |
| B05 colon before a list | 2 | `COLON`×2 |


### A.3 DISTRACTOR ARCHITECTURE — pivoted on the keyed mark

This is the operational table. Read it as: *"when the key is X, the three distractors are drawn from this pool, most often in this exact triple."*

| KEY shape | n | distractor pool | modal distractor triples |
|---|---|---|---|
| `NONE` | 35 | `COMMA`×38, `COLON`×21, `SEMI`×15, `DASH`×13, `PAIRED_COMMA`×10, `PERIOD`×4 | 9× {COLON, COMMA, SEMI}<br>9× {COLON, COMMA, DASH}<br>4× {COMMA, COMMA, PAIRED_COMMA} |
| `COMMA` | 25 | `NONE`×18, `SEMI`×14, `PERIOD`×13, `COLON`×9, `DASH`×5, `CONJonly`×4 | 6× {NONE, PERIOD, SEMI}<br>3× {COLON, NONE, SEMI}<br>3× {COMMA&CONJ, CONJonly, NONE} |
| `PERIOD` | 21 | `NONE`×22, `COMMA`×15, `QMARK`×14, `PERIOD`×8, `SEMI`×2, `DASH`×1 | 8× {COMMA, NONE, NONE}<br>7× {PERIOD, QMARK, QMARK}<br>2× {COMMA, NONE, SEMI} |
| `COMMA&CONJ` | 11 | `COMMA`×9, `CONJonly`×8, `NONE`×8, `COLON&CONJ`×2, `COMMA&CONJ`×2, `PAIRED_COMMA&CONJ`×2 | 7× {COMMA, CONJonly, NONE}<br>1× {COLON&CONJ, PERIOD&CONJ, SEMI&CONJ}<br>1× {COLON&CONJ, COMMA&CONJ, PAIRED_COMMA&CONJ} |
| `COLON` | 10 | `NONE`×8, `COMMA`×7, `PERIOD`×6, `SEMI`×6, `CONJonly`×1, `COMMA&CONJ`×1 | 3× {NONE, PERIOD, SEMI}<br>2× {COMMA, PERIOD, SEMI}<br>1× {COMMA, COMMA, NONE} |
| `SEMI` | 9 | `COMMA`×10, `NONE`×9, `CONJonly`×3, `PERIOD`×2, `COLON`×2, `PAIRED_COMMA`×1 | 3× {COMMA, CONJonly, NONE}<br>2× {COMMA, NONE, PERIOD}<br>2× {COLON, COMMA, NONE} |
| `DASH` | 8 | `NONE`×8, `COMMA`×7, `COLON`×4, `SEMI`×3, `DASH`×1, `PERIOD`×1 | 4× {COLON, COMMA, NONE}<br>2× {COMMA, NONE, SEMI}<br>1× {COMMA, DASH, NONE} |
| `QMARK` | 5 | `PERIOD`×10, `QMARK`×4, `BANG`×1 | 4× {PERIOD, PERIOD, QMARK}<br>1× {BANG, PERIOD, PERIOD} |
| `SEMI+COMMA` | 5 | `PAIRED_COMMA`×5, `COMMA`×5, `NONE`×2, `COMMA+COLON`×1, `SEMI+SEMI`×1, `COMMA+SEMI`×1 | 2× {COMMA, NONE, PAIRED_COMMA}<br>1× {COMMA+COLON, PAIRED_COMMA, SEMI+SEMI}<br>1× {COMMA, COMMA, PAIRED_COMMA} |
| `PAIRED_COMMA` | 4 | `SEMI+COMMA`×3, `COMMA`×3, `COMMA+SEMI`×3, `PERIOD`×1, `PERIOD+COMMA`×1, `COLON`×1 | 1× {COMMA, PERIOD, SEMI+COMMA}<br>1× {COMMA, COMMA+SEMI, SEMI+COMMA}<br>1× {COMMA+SEMI, PERIOD+COMMA, SEMI+COMMA} |


**The five canonical Boundaries distractor frames.** Every one of the 150 items is built from one of these:

1. **The four-way mark swap** (most common, ~40% of items). One word, four punctuation states: `word` / `word,` / `word;` / `word —` or `word` / `word,` / `word:` / `word;`. Used whenever the answer is either *no punctuation* or a single supplementary mark. When the key is `NONE`, the modal triples are literally `{COLON, COMMA, SEMI}` (9×) and `{COLON, COMMA, DASH}` (9×).
2. **The clause-boundary quartet.** `word` (run-on) / `word,` (comma splice) / `word, and` / `word and`. When the key is `COMMA&CONJ`, the triple is `{COMMA, CONJonly, NONE}` in **7 of 11** items. When the key is `SEMI`, the triple is `{COMMA, CONJonly, NONE}` (3×) or `{COMMA, NONE, PERIOD}` (2×).
3. **The terminal-mark quartet** (`PERIOD` key). `word. Next` / `word next` / `word, next` / `word and next` — i.e. period vs run-on vs comma splice vs bare conjunction. Modal triple `{COMMA, NONE, NONE}` (8×).
4. **The matched-pair test.** The blank supplies the *closing* mark of a supplement whose opening mark is already printed in the passage. Distractors offer the three non-matching marks (`;` `.` nothing) — modal triple `{NONE, PERIOD, SEMI}` (6×). This is the single most common Hard Boundaries frame.
5. **The declarative/interrogative quartet** (`B11`). Two variables crossed: word order (S-V vs V-S) × terminal mark (`.` vs `?`), giving exactly four options. 12/12 of these items are tagged **Easy**.

**Two engineered errors dominate the distractor set.** Across the 150 Boundaries items CB's rationales name a **comma splice** in 43 items (50 distractors) and a **run-on / fused sentence** in 42 items (83 distractors). A further 33 items (130 distractors) are wrong solely because *no punctuation is needed* (subject–verb, verb–object, preposition–complement). 31 items carry a distractor whose only fault is a **colon after something that is not an independent clause**; 23 carry a **semicolon that is not joining two main clauses**; 18 carry an **unmatched pair** (`,`…`—`, `—`…`,`, `:`…`—`).

**Answer-position:** D 47 / C 46 / B 34 / A 23. CB skews the key late.


### A.4 Verbatim option sets by rule


##### B01 clause boundary: 2 main clauses (semicolon / period / comma+conj) — verbatim option sets (n=39)

* `148be4da` · Easy · key **D**
  > Human-made (synthetic) fibers used in clothes and many other consumer products are more durable than most natural plant _____ the manufacture of synthetic fibers requires toxic chemical…
  - A) `fibers,`  `[COMMA]`
  - B) `fibers but`  `[CONJonly]`
  - C) `fibers`  `[NONE]`
  - D) `fibers, but` **← KEY**  `[COMMA&CONJ]`

* `8a3998f1` · Easy · key **C**
  > …ngdom began rolling out taxes equivalent to a few cents on single-use plastic grocery bags in 2011, plastic-bag consumption decreased by up to ninety _____ taxes are subject to what economists call the “rebound effe…
  - A) `percent, such`  `[COMMA]`
  - B) `percent and such`  `[NONE]`
  - C) `percent. Such` **← KEY**  `[PERIOD]`
  - D) `percent such`  `[NONE]`

* `7b950fc2` · Easy · key **D**
  > In 2000, Nora de Hoyos Comstock, herself an owner of a successful consulting firm, sought to increase Latina representation in corporate _____ founded Las Comadres para las Americas, an international co…
  - A) `settings she`  `[NONE]`
  - B) `settings, she`  `[COMMA]`
  - C) `settings and she`  `[NONE]`
  - D) `settings. She` **← KEY**  `[PERIOD]`

* `82a76537` · Medium · key **B**
  > …for storing and transmitting data. Keys function as labels, while values contain the actual information. In a JSON file storing data about fire belly _____ instance, you could encounter a key such as “species” with…
  - A) `newts. For`  `[PERIOD&CONJ]`
  - B) `newts, for` **← KEY**  `[COMMA&CONJ]`
  - C) `newts: for`  `[COLON&CONJ]`
  - D) `newts; for`  `[SEMI&CONJ]`

* `a12e3b8a` · Medium · key **C**
  > …ves a service issue may regard that company more positively than they would if no such issue had occurred. This idea is known as the service recovery _____ research suggests that it has important implications for cu…
  - A) `paradox,`  `[COMMA]`
  - B) `paradox`  `[NONE]`
  - C) `paradox, and` **← KEY**  `[COMMA&CONJ]`
  - D) `paradox and,`  `[COMMA&CONJ]`

* `707461d8` · Hard · key **A**
  > …an biologist Martha Lydia Macías-Rubalcava led a review of the scientific literature related to endophytic fungi (i.e., fungi that live inside a host _____ researching 120 endophytic fungi – produced compounds, she…
  - A) `plant). By` **← KEY**  `[CPAREN+PERIOD]`
  - B) `plant), by`  `[CPAREN+COMMA]`
  - C) `plant) and by`  `[CPAREN]`
  - D) `plant) by`  `[CPAREN]`

* `886dc9f9` · Hard · key **B**
  > On July 23, 1854, a clipper ship called the Flying Cloud entered San Francisco _____ left New York Harbor under the guidance of Captain Josiah P…
  - A) `Bay and having`  `[NONE]`
  - B) `Bay. Having` **← KEY**  `[PERIOD]`
  - C) `Bay, having`  `[COMMA]`
  - D) `Bay having`  `[NONE]`

* `73a6603c` · Hard · key **C**
  > On sunny days, dark rooftops absorb solar energy and convert it to unwanted heat, raising the surrounding air _____ a light-colored covering to an existing dark roof, either b…
  - A) `temperature; by adding`  `[SEMI]`
  - B) `temperature, adding`  `[COMMA]`
  - C) `temperature. Adding` **← KEY**  `[PERIOD]`
  - D) `temperature by adding`  `[NONE]`


##### B03 supplementary element w/ paired marks — verbatim option sets (n=40)

* `486f03da` · Easy · key **D**
  > The short story “Rogue Enchantments” by Isabel Iba ñez appears in Reclaim the _____ anthology of fantasy and science fiction written by authors…
  - A) `Stars. An`  `[PERIOD]`
  - B) `Stars, while an`  `[COMMA]`
  - C) `Stars an`  `[NONE]`
  - D) `Stars, an` **← KEY**  `[COMMA]`

* `72b3db98` · Easy · key **D**
  > Mia Heavener’s 2019 novel Under Nushagak Bluff, which takes place in a mid-twentieth-century rural Alaskan fishing _____ the story of three Yup’ik women who grapple with the rise o…
  - A) `village. Tells`  `[PERIOD]`
  - B) `village tells`  `[NONE]`
  - C) `village: tells`  `[COLON]`
  - D) `village, tells` **← KEY**  `[COMMA]`

* `ac5536c1` · Medium · key **D**
  > …known for writing and illustrating children’s books such as The Tale of Peter Rabbit (1902), but she also dedicated herself to mycology, the study of _____ more than 350 paintings of the fungal species she observed…
  - A) `fungi; producing`  `[SEMI]`
  - B) `fungi. Producing`  `[PERIOD]`
  - C) `fungi producing`  `[NONE]`
  - D) `fungi, producing` **← KEY**  `[COMMA]`

* `a427a52c` · Medium · key **C**
  > …Light system, developed by Kenyan inventor Richard Turere, consists of LED lights installed around the perimeter of livestock pastures. Powered with _____ the blinking LEDs keep lions away at night, thus protecting…
  - A) `energy collected, by solar panels, during the day`  `[PAIRED_COMMA]`
  - B) `energy collected by solar panels during the day`  `[NONE]`
  - C) `energy collected by solar panels during the day,` **← KEY**  `[COMMA]`
  - D) `energy, collected by solar panels during the day,`  `[PAIRED_COMMA]`

* `40c3589d` · Medium · key **D**
  > …is the inaugural poet laureate of the Navajo Nation. Her book S áanii Dahataal/The Women Are Singing—a combination of fiction and memoir, poetry and _____ serves as a testament to her versatility as a writer.…
  - A) `prose;`  `[SEMI]`
  - B) `prose`  `[NONE]`
  - C) `prose,`  `[COMMA]`
  - D) `prose —` **← KEY**  `[DASH]`

* `435809d8` · Hard · key **B**
  > …rnational shipping container vessel, became lodged in Egypt’s Suez Canal, a major shipping route between Europe and Asia. The vessel took six days to _____ it’s as heavy as two thousand blue whales when fully loaded…
  - A) `dislodge in part due to its sheer size,`  `[COMMA]`
  - B) `dislodge, in part due to its sheer size:` **← KEY**  `[COMMA+COLON]`
  - C) `dislodge, in part due to its sheer size,`  `[PAIRED_COMMA]`
  - D) `dislodge, in part, due to its sheer size`  `[PAIRED_COMMA]`

* `109d5bbb` · Hard · key **B**
  > ‘ With some 16,000 in attendance, the Second World Black and African Festival of Arts and _____ or FESTAC 77, as the event was more commonly known — became…
  - A) `Culture:`  `[COLON]`
  - B) `Culture —` **← KEY**  `[DASH]`
  - C) `Culture,`  `[COMMA]`
  - D) `Culture`  `[NONE]`

* `c15069eb` · Hard · key **A**
  > …atin America is known to have dozens, if not hundreds, of popular dance forms. Only five of these dances are included in international ballroom dance _____ rumba, samba, cha-cha-cha, paso doble, and jive — the last…
  - A) `competitions, however:` **← KEY**  `[COMMA+COLON]`
  - B) `competitions, however,`  `[PAIRED_COMMA]`
  - C) `competitions, however;`  `[COMMA+SEMI]`
  - D) `competitions; however,`  `[SEMI+COMMA]`


##### B04 restrictive/integrated modifier (no punctuation) — verbatim option sets (n=10)

* `6997261f` · Easy · key **C**
  > In 2009, researchers determined that pottery fragments from a cave in China were close to 18,000 years old. These are some of the oldest _____ of pottery ever found.…
  - A) `pieces:`  `[COLON]`
  - B) `pieces,`  `[COMMA]`
  - C) `pieces` **← KEY**  `[NONE]`
  - D) `pieces —`  `[DASH]`

* `cabe71d4` · Easy · key **B**
  > …trated by the lack of diverse characters in books for young people. In 2011, these two writers joined forces to found CAKE Literary, a book packaging _____ specializes in the creation and promotion of stories told f…
  - A) `company,`  `[COMMA]`
  - B) `company that` **← KEY**  `[NONE]`
  - C) `company`  `[NONE]`
  - D) `company, that`  `[COMMA]`

* `145d5ca7` · Medium · key **D**
  > Gathering accurate data on water flow in the United States is challenging because of the country’s millions of miles of _____ the volume and speed of water at any given location can var…
  - A) `waterways and the fact that,`  `[COMMA]`
  - B) `waterways, and the fact that,`  `[PAIRED_COMMA]`
  - C) `waterways, and, the fact that`  `[PAIRED_COMMA]`
  - D) `waterways and the fact that` **← KEY**  `[NONE]`

* `d198997b` · Medium · key **B**
  > …stract works, such as his 10-painting series Fifty Days at Iliam. In these works, Twombly’s artistic style is exemplified by his use of graffiti-like _____ often incorporate words or phrases from poetry and mytholog…
  - A) `scribbles: that`  `[COLON]`
  - B) `scribbles that` **← KEY**  `[NONE]`
  - C) `scribbles; that`  `[SEMI]`
  - D) `scribbles. That`  `[PERIOD]`

* `13fcf575` · Hard · key **C**
  > …the warm air rising from Venezuela’s coastal Lake Maracaibo, the result is a spectacular lightning storm, its strikes so bright, so localized, and so _____ that it has become known as “Maracaibo’s Lighthouse.”…
  - A) `dependable:`  `[COLON]`
  - B) `dependable;`  `[SEMI]`
  - C) `dependable` **← KEY**  `[NONE]`
  - D) `dependable,`  `[COMMA]`

* `59a246dc` · Hard · key **D**
  > …ound minuscule defects in the material, resulting in fractures. Recently, engineer Erkka Frankberg of Tampere University in Finland used the chemical _____ to make a glassy solid that can withstand higher strain tha…
  - A) `compound, aluminum oxide`  `[COMMA]`
  - B) `compound aluminum oxide,`  `[COMMA]`
  - C) `compound, aluminum oxide,`  `[PAIRED_COMMA]`
  - D) `compound aluminum oxide` **← KEY**  `[NONE]`

* `5ef9fc48` · Hard · key **C**
  > …ially disordered systems will naturally move toward greater order according to the principle of self-organization, a conceptual framework for pattern _____ biologists believe can be used to explain a range of organi…
  - A) `formation, that some`  `[COMMA]`
  - B) `formation. Some`  `[PERIOD]`
  - C) `formation that some` **← KEY**  `[NONE]`
  - D) `formation; some`  `[SEMI]`

* `d4fe8f03` · Hard · key **B**
  > Paintings by the renowned twentieth-century US _____ were featured in Artist to Artist, an exhibition at the Smi…
  - A) `artists: Thomas Hart Benton and Jackson Pollock,`  `[COLON+COMMA]`
  - B) `artists Thomas Hart Benton and Jackson Pollock` **← KEY**  `[NONE]`
  - C) `artists Thomas Hart Benton, and Jackson Pollock,`  `[PAIRED_COMMA]`
  - D) `artists, Thomas Hart Benton and Jackson Pollock`  `[COMMA]`


##### B05 colon before a list — verbatim option sets (n=2)

* `c3397d25` · Medium · key **B**
  > Since the nineteenth century, Egyptologists have commonly divided ancient Egyptian history into three primary _____ Old Kingdom (2700 – 2200 BCE), the Middle Kingdom (2050 – 1…
  - A) `periods. The`  `[PERIOD]`
  - B) `periods: the` **← KEY**  `[COLON]`
  - C) `periods; the`  `[SEMI]`
  - D) `periods, the`  `[COMMA]`

* `da53d726` · Medium · key **A**
  > …of the First World War, women from ten countries around the world convened the Inter-Allied Women’s Conference in Paris. The conference’s goals were _____ ensure women’s participation in the proceedings of the Pari…
  - A) `threefold: to` **← KEY**  `[COLON]`
  - B) `threefold. To`  `[PERIOD]`
  - C) `threefold to`  `[NONE]`
  - D) `threefold; to`  `[SEMI]`


##### B06 colon before an explanation — verbatim option sets (n=8)

* `fba5d8d1` · Hard · key **D**
  > …siological response akin to goosebumps or getting the chills) while listening to music, there was one personality trait that they scored particularly _____ openness to experience.…
  - A) `high. On`  `[PERIOD]`
  - B) `high on;`  `[SEMI]`
  - C) `high on`  `[NONE]`
  - D) `high on:` **← KEY**  `[COLON]`

* `e76e74e8` · Hard · key **A**
  > …eriment in the psychology of choice, professor Sheena Iyengar set up a jam-tasting booth at a grocery store. The number of jams available for tasting _____ some shoppers had twenty-four different options, others onl…
  - A) `varied:` **← KEY**  `[COLON]`
  - B) `varied,`  `[COMMA]`
  - C) `varied, while`  `[COMMA]`
  - D) `varied while`  `[NONE]`

* `6fac7f45` · Hard · key **B**
  > …Like many of Ay-O s paintings, Butterfly, which portrays a swimmer performing the ’ butterfly stroke, attempts to make use of the entire visual light _____ sporting rainbow-striped goggles, the rainbow-hued swimmer…
  - A) `spectrum`  `[NONE]`
  - B) `spectrum:` **← KEY**  `[COLON]`
  - C) `spectrum while`  `[NONE]`
  - D) `spectrum, while`  `[COMMA]`

* `e9aee0d8` · Hard · key **A**
  > …Committee of Correspondence. By 1774, what had started as a local means of mobilizing support for the Patriot cause had grown into something far more _____ network of such committees that, facilitating communication…
  - A) `extensive: a` **← KEY**  `[COLON]`
  - B) `extensive; a`  `[SEMI]`
  - C) `extensive, it was a`  `[COMMA]`
  - D) `extensive. A`  `[PERIOD]`

* `9579581e` · Hard · key **C**
  > As cheesemaking practices spread throughout Europe and Asia during and after the Neolithic, divergent strategies for preserving milk _____ whereas rennet-coagulated cheesemaking became key to milk p…
  - A) `emerged`  `[NONE]`
  - B) `emerged and`  `[CONJonly]`
  - C) `emerged:` **← KEY**  `[COLON]`
  - D) `emerged,`  `[COMMA]`

* `c468db1c` · Hard · key **D**
  > …ed by Axel Mithöfer at the Max Planck Institute for Chemical Ecology in Germany examined the defensive responses of two varieties of the sweet potato _____ TN57, which is known for its insect resistance, and TN66, w…
  - A) `plant.`  `[PERIOD]`
  - B) `plant;`  `[SEMI]`
  - C) `plant`  `[NONE]`
  - D) `plant:` **← KEY**  `[COLON]`

* `bb4557cf` · Hard · key **D**
  > The relationship between genomes and epigenomes reveals how cells with identical DNA develop different _____ whereas the genome in each cell contains a complete DNA seq…
  - A) `functions`  `[NONE]`
  - B) `functions,`  `[COMMA]`
  - C) `functions and,`  `[COMMA&CONJ]`
  - D) `functions:` **← KEY**  `[COLON]`

* `c101fc44` · Hard · key **A**
  > …he marks found on the fossilized teeth of skeletons, but in 2017 a team led by Laura Weyrich of the Australian Centre for Ancient DNA tried something _____ the DNA found in Neanderthals’ fossilized dental plaque.…
  - A) `new: sequencing` **← KEY**  `[COLON]`
  - B) `new; sequencing`  `[SEMI]`
  - C) `new, sequencing:`  `[COMMA+COLON]`
  - D) `new. Sequencing`  `[PERIOD]`


##### B07 no punctuation inside a clause — verbatim option sets (n=21)

* `de55ec71` · Easy · key **A**
  > – Generations of mystery and horror _____ have been influenced by the dark, gothic stories of celebra…
  - A) `writers` **← KEY**  `[NONE]`
  - B) `writers,`  `[COMMA]`
  - C) `writers —`  `[DASH]`
  - D) `writers;`  `[SEMI]`

* `a1e0c981` · Easy · key **B**
  > In her book The Woman Warrior: Memoirs of a Girlhood Among Ghosts, author Maxine Hong Kingston examines themes _____ childhood, womanhood, and Chinese American identity by inte…
  - A) `of:`  `[COLON]`
  - B) `of` **← KEY**  `[NONE]`
  - C) `of —`  `[DASH]`
  - D) `of,`  `[COMMA]`

* `6fdddabf` · Easy · key **B**
  > ’ The part of a compound that determines the compound s color is _____ the chromophore. One example of a chromophore is hemoglobin…
  - A) `called,`  `[COMMA]`
  - B) `called` **← KEY**  `[NONE]`
  - C) `called—`  `[DASH]`
  - D) `called;`  `[SEMI]`

* `eb03096e` · Easy · key **D**
  > …ent, and practice sustaining the ea—or life breath” between the Hawaiian people and their natural environments. The concept has been proudly embodied _____ Native Hawaiians for generations, contributing to the lush…
  - A) `by;`  `[SEMI]`
  - B) `by:`  `[COLON]`
  - C) `by,`  `[COMMA]`
  - D) `by` **← KEY**  `[NONE]`

* `831b55ec` · Easy · key **C**
  > Louise Bennett (1919 – 2006), also known as “ Miss Lou,” was an influential Jamaican poet and folklorist. Her innovative poems _____ the use of Jamaican Creole (a spoken language) in literatur…
  - A) `popularized;`  `[SEMI]`
  - B) `popularized,`  `[COMMA]`
  - C) `popularized` **← KEY**  `[NONE]`
  - D) `popularized:`  `[COLON]`

* `261f4ca6` · Easy · key **A**
  > The capital city of the Aztec empire, Tenochtitlan, was built on an island in a lake. Because of the marshy conditions, the Aztec people _____ floating farms called “ chinampas. ”…
  - A) `created` **← KEY**  `[NONE]`
  - B) `created:`  `[COLON]`
  - C) `created,`  `[COMMA]`
  - D) `created;`  `[SEMI]`

* `cdbbbf94` · Medium · key **D**
  > …rotation rate means that measurements of time must be periodically adjusted. Specifically, an extra “leap second” (the 86,401st second of the day) is _____ time based on the planet’s rotation lags a full nine-tenths…
  - A) `added, whenever`  `[COMMA]`
  - B) `added; whenever`  `[SEMI]`
  - C) `added. Whenever`  `[PERIOD]`
  - D) `added whenever` **← KEY**  `[NONE]`

* `d073983d` · Medium · key **D**
  > Known for her massive photorealistic paintings of African American figures floating or swimming in pools, Calida Garcia _____ was the logical ’ choice to design the book cover for Ta-Ne…
  - A) `Rawles —`  `[DASH]`
  - B) `Rawles:`  `[COLON]`
  - C) `Rawles,`  `[COMMA]`
  - D) `Rawles` **← KEY**  `[NONE]`


##### B08 semicolons in a complex series — verbatim option sets (n=6)

* `e2f77ae7` · Medium · key **C**
  > …xistence of three near-contemporary “continuations” of the collection: The Siege of Thebes, which purports to be a new tale told during the pilgrims’ _____ The Tale of Beryn, which depicts the pilgrims as tourists;…
  - A) `return.`  `[PERIOD]`
  - B) `return`  `[NONE]`
  - C) `return;` **← KEY**  `[SEMI]`
  - D) `return,`  `[COMMA]`

* `aaa1907f` · Hard · key **B**
  > …l families during the Great Depression, innovative New York City librarian Pura Belpr é offered storytelling in both English and Spanish, an uncommon _____ celebrated el Día de los Tres Reyes Magos, an important com…
  - A) `practice, at the time`  `[COMMA]`
  - B) `practice at the time;` **← KEY**  `[SEMI]`
  - C) `practice, at the time,`  `[PAIRED_COMMA]`
  - D) `practice at the time,`  `[COMMA]`

* `9c3630b9` · Hard · key **B**
  > Using natural debris, such as dried _____ such as plastic bags; and more traditional art supplies, su…
  - A) `leaves, man-made trash:`  `[COMMA+COLON]`
  - B) `leaves; man-made trash,` **← KEY**  `[SEMI+COMMA]`
  - C) `leaves, man-made trash,`  `[PAIRED_COMMA]`
  - D) `leaves; man-made trash;`  `[SEMI+SEMI]`

* `c04e9136` · Hard · key **D**
  > …chemistry: two-time Nobel laureate Barry Sharpless, who coined the term “click chemistry” in 1998; Carolyn Bertozzi, founder of the Bertozzi Group at _____ and Morten Meldal, a professor at the University of Copenha…
  - A) `Stanford`  `[NONE]`
  - B) `Stanford,`  `[COMMA]`
  - C) `Stanford:`  `[COLON]`
  - D) `Stanford;` **← KEY**  `[SEMI]`

* `c49e946e` · Hard · key **C**
  > …f Congress, Carla Hayden has many responsibilities. These include overseeing the Library of Congress’s collections, which boast more than 162 million _____ the US Copyright Office, which registers copyright claims a…
  - A) `items managing`  `[NONE]`
  - B) `items, managing`  `[COMMA]`
  - C) `items; managing` **← KEY**  `[SEMI]`
  - D) `items. Managing`  `[PERIOD]`

* `952fd392` · Hard · key **B**
  > …thor of Reading Popular Culture in Victorian Print, tracks the transnational dissemination of works by author Mary Elizabeth Braddon via the magazine _____ from 1866 to 1899 and distributed throughout the Australian…
  - A) `Belgravia; published`  `[SEMI]`
  - B) `Belgravia. Published` **← KEY**  `[PERIOD]`
  - C) `Belgravia published`  `[NONE]`
  - D) `Belgravia, published`  `[COMMA]`


##### B09 commas in a simple series — verbatim option sets (n=3)

* `6fece68e` · Easy · key **D**
  > …e in South Asia from roughly 270 to 232 BCE. He is known for enforcing a moral code called the Law of Piety, which established the sanctity of animal _____ the just treatment of the elderly, and the abolition of the…
  - A) `life`  `[NONE]`
  - B) `life;`  `[SEMI]`
  - C) `life:`  `[COLON]`
  - D) `life,` **← KEY**  `[COMMA]`

* `c88d6301` · Easy · key **C**
  > …Latino filmmakers Luis Valdez, Gregory Nava, and Ram ón Menéndez helped expand on-screen representation of Latino Americans with the films Zoot Suit _____ and Stand and Deliver (1988), respectively.…
  - A) `(1981) El Norte (1983),`  `[OPAREN+CPAREN+OPAREN+CPAREN+COMMA]`
  - B) `(1981) —El Norte (1983) —`  `[OPAREN+CPAREN+DASH+OPAREN+CPAREN+DASH]`
  - C) `(1981), El Norte (1983),` **← KEY**  `[OPAREN+CPAREN+COMMA+OPAREN+CPAREN+COMMA]`
  - D) `(1981) El Norte (1983)`  `[OPAREN+CPAREN+OPAREN+CPAREN]`

* `e15c50b2` · Easy · key **B**
  > …ype of autonomous robot, measures temperature and salinity in the upper regions of ice-free oceans. More advanced floats can measure a wider range of _____ and monitor seasonal ice zones.…
  - A) `variables: travel to greater depths`  `[COLON]`
  - B) `variables, travel to greater depths,` **← KEY**  `[PAIRED_COMMA]`
  - C) `variables travel to greater depths,`  `[COMMA]`
  - D) `variables, travel to greater depths;`  `[COMMA+SEMI]`


##### B10 no punct: title + proper name — verbatim option sets (n=5)

* `960dec02` · Hard · key **C**
  > A recent study tracked the number of bee species present in twenty-seven New York apple orchards over a ten-year period. _____ found that when wild growth near an orchard was cleared, th…
  - A) `Entomologist Heather Grab:`  `[COLON]`
  - B) `Entomologist, Heather Grab,`  `[PAIRED_COMMA]`
  - C) `Entomologist Heather Grab` **← KEY**  `[NONE]`
  - D) `Entomologist Heather Grab,`  `[COMMA]`

* `4dcedc31` · Hard · key **A**
  > …they must first be able to monitor reactions between oxygen and existing iron nanoparticles at a near-atomic level of detail. Fortunately, chemistry _____ and his colleagues at Temple University recently developed…
  - A) `professor Yugang Sun` **← KEY**  `[NONE]`
  - B) `professor Yugang Sun,`  `[COMMA]`
  - C) `professor, Yugang Sun,`  `[PAIRED_COMMA]`
  - D) `professor, Yugang Sun`  `[COMMA]`

* `6d4b2e1e` · Hard · key **D**
  > …And the Soul Shall Dance depicts two Japanese American farming families in Depression-era Southern California. Critics have noted the way pioneering _____ compares the experiences of issei (Japanese nationals who e…
  - A) `playwright, Wakako Yamauchi,`  `[PAIRED_COMMA]`
  - B) `playwright, Wakako Yamauchi`  `[COMMA]`
  - C) `playwright Wakako Yamauchi,`  `[COMMA]`
  - D) `playwright Wakako Yamauchi` **← KEY**  `[NONE]`

* `78e978b5` · Hard · key **D**
  > …e, in July 2021, a hypothetical basket of goods priced at 100 US dollars (USD) in the United States would have cost 62 USD and 110 USD in fellow OECD _____ and Luxembourg, respectively.…
  - A) `nations, Chile`  `[COMMA]`
  - B) `nations; Chile`  `[SEMI]`
  - C) `nations: Chile`  `[COLON]`
  - D) `nations Chile` **← KEY**  `[NONE]`

* `5aae2475` · Hard · key **C**
  > …a leaf that absorb gases needed for plant growth, open when guard cells surrounding each pore swell with water. In a pivotal 2007 article, plant cell _____ showed that lipid molecules called phosphatidylinositol pho…
  - A) `biologist, Yuree Lee`  `[COMMA]`
  - B) `biologist Yuree Lee,`  `[COMMA]`
  - C) `biologist Yuree Lee` **← KEY**  `[NONE]`
  - D) `biologist, Yuree Lee,`  `[PAIRED_COMMA]`


##### B11 end punctuation: declarative period vs question mark — verbatim option sets (n=12)

* `4b0c7b62` · Easy · key **C**
  > The algaita is a double reed wind instrument from West Africa. The reed of a wind instrument is the mouthpiece _____ A double reed contains two pieces of cane that vibrate and…
  - A) `where sound is made?`  `[QMARK]`
  - B) `where is sound made.`  `[PERIOD]`
  - C) `where sound is made.` **← KEY**  `[PERIOD]`
  - D) `where is sound made?`  `[QMARK]`

* `a7c85001` · Easy · key **D**
  > Researchers Amit Kumar and Nicholas Epley investigated how _____ In a series of experiments conducted in 2022, they found th…
  - A) `do people perceive acts of kindness.`  `[PERIOD]`
  - B) `do people perceive acts of kindness?`  `[QMARK]`
  - C) `people perceive acts of kindness?`  `[QMARK]`
  - D) `people perceive acts of kindness.` **← KEY**  `[PERIOD]`

* `9091458d` · Easy · key **D**
  > Emperor penguins don’t waddle out of the ocean. They launch themselves at such a high speed that they travel up to two meters before landing. How _____ A layer of microbubbles on their plumage reduces friction a…
  - A) `they are able to move so fast!`  `[BANG]`
  - B) `are they able to move so fast.`  `[PERIOD]`
  - C) `they are able to move so fast.`  `[PERIOD]`
  - D) `are they able to move so fast?` **← KEY**  `[QMARK]`

* `b0115ef6` · Easy · key **B**
  > …when pressure is applied to them. The toxic nature of some of these materials recently led a team from the University of Sheffield to investigate how _____ …
  - A) `could their use be better regulated?`  `[QMARK]`
  - B) `their use could be better regulated.` **← KEY**  `[PERIOD]`
  - C) `their use could be better regulated?`  `[QMARK]`
  - D) `could their use be better regulated.`  `[PERIOD]`

* `aab78b25` · Easy · key **D**
  > Psychophysicist Howard Moskowitz was hired by a soda company to determine how much artificial sweetener _____ After conducting consumer taste tests, he found that no suc…
  - A) `do most people prefer in a diet drink?`  `[QMARK]`
  - B) `do most people prefer in a diet drink.`  `[PERIOD]`
  - C) `most people prefer in a diet drink?`  `[QMARK]`
  - D) `most people prefer in a diet drink.` **← KEY**  `[PERIOD]`

* `39ac6498` · Easy · key **C**
  > In forecasting weather events, meteorologists sometimes discuss the role of atmospheric rivers. What are atmospheric rivers, and how _____ Part of the water cycle, atmospheric rivers are narrow chan…
  - A) `do they affect our weather.`  `[PERIOD]`
  - B) `they do affect our weather.`  `[PERIOD]`
  - C) `do they affect our weather?` **← KEY**  `[QMARK]`
  - D) `they do affect our weather?`  `[QMARK]`

* `8459dc2f` · Easy · key **D**
  > …he first one or two results. Click restraint is the practice of scanning a search results page and evaluating what you see before deciding which link _____ …
  - A) `should you choose.`  `[PERIOD]`
  - B) `you should choose?`  `[QMARK]`
  - C) `should you choose?`  `[QMARK]`
  - D) `you should choose.` **← KEY**  `[PERIOD]`

* `5aa1fffd` · Easy · key **C**
  > Where _____ Interestingly, it was invented by an author. It first appea…
  - A) `did the word “chortle” come from.`  `[PERIOD]`
  - B) `the word “chortle” did come from?`  `[QMARK]`
  - C) `did the word “chortle” come from?` **← KEY**  `[QMARK]`
  - D) `the word “chortle” come from.`  `[PERIOD]`


##### B12 comma after intro subordinate/participial phrase — verbatim option sets (n=4)

* `b35cefb7` · Easy · key **B**
  > The fine, powdery substance that covers the Moon’s surface is called regolith. Because regolith is both readily available and high in oxygen _____ scientists have wondered whether it could be used as a pote…
  - A) `content and`  `[CONJonly]`
  - B) `content,` **← KEY**  `[COMMA]`
  - C) `content`  `[NONE]`
  - D) `content, and`  `[COMMA&CONJ]`

* `d75d57a0` · Easy · key **C**
  > While many video game creators strive to make their graphics ever more _____ others look to the past, developing titles with visuals ins…
  - A) `lifelike but`  `[CONJonly]`
  - B) `lifelike`  `[NONE]`
  - C) `lifelike,` **← KEY**  `[COMMA]`
  - D) `lifelike, but`  `[COMMA&CONJ]`

* `fe41f258` · Medium · key **A**
  > …hilosopher whose beliefs revolved around the pursuit of pleasure. Epicurus defined pleasure as “the absence of pain in the body and of trouble in the _____ that all life’s virtues derived from this absence.…
  - A) `soul,” positing` **← KEY**  `[COMMA]`
  - B) `soul”: positing`  `[COLON]`
  - C) `soul”; positing`  `[SEMI]`
  - D) `soul.” Positing`  `[PERIOD]`

* `8a264a54` · Hard · key **D**
  > With a blend of traditional design elements, such as arched Gothic ceilings, and modern ones, such as floor-to-ceiling _____ design splits the difference between old and new, a mixture…
  - A) `windows; transitional`  `[SEMI]`
  - B) `windows — transitional`  `[DASH]`
  - C) `windows. Transitional`  `[PERIOD]`
  - D) `windows, transitional` **← KEY**  `[COMMA]`



---


## B. FORM, STRUCTURE, AND SENSE — rule taxonomy, distribution, distractor architecture

| Rule | n | share | difficulty (E/M/H) | typical position |
|---|---|---|---|---|
| **F01 subject-verb agreement** | 44 | 29% | E16 / M13 / H15 | q18–q24 (early-mid) |
| **F03 finite vs nonfinite verb form** | 36 | 24% | E21 / M4 / H11 | q18–q22 (early) |
| **F02 verb tense / aspect sequencing** | 24 | 16% | E20 / M3 / H1 | q18–q21 (earliest) |
| **F06 subject-modifier placement (dangling modifier)** | 17 | 11% | E1 / M4 / H12 | q24–q28 (latest) |
| **F04 pronoun-antecedent agreement** | 13 | 9% | E7 / M3 / H3 | q19–q23 (early) |
| **F05 possessives / plurals / contractions** | 11 | 7% | E3 / M5 / H3 | q22–q27 (mid-late) |
| **F07 determiners (this/that/these/those)** | 2 | 1% | E2 / M0 / H0 | q19–q21 |
| **F08 plural vs singular noun** | 2 | 1% | E0 / M1 / H1 | q24–q27 |
| **F99 unclassified (subject–verb, mislabelled by the rationale parser)** | 1 | 1% | E0 / M0 / H1 | — |


Note what is **absent**. In 150 official FSS items there is **not a single**: comparative-vs-superlative item, "the reason is because" item, illogical/unparallel comparison item, or parallel-structure-in-a-list item. Those are legacy paper-SAT categories and should not be written. Modifier logic appears **only** as *subject–modifier placement* (dangling modifier), never as misplaced-adverb or squinting-modifier.


### B.1 THE MASTER FACT: the FSS distractor set is a single-variable sweep

For every FSS subtype, the three distractors differ from the key on **exactly one grammatical dimension**, and they vary *tense and aspect* purely as camouflage. Concretely, for subject–verb agreement:

- **39 of 44** subject–verb items have **all three distractors in the opposite number from the key**. The student who correctly identifies the subject's number can eliminate 3 choices without reading them.
- Key number: **28 singular / 15 plural** (65% singular).
- The four canonical F01 quartets, in order of frequency:
  - key = `V-s` → distractors `{base V, are V-ing, have V-en}` — 11×
  - key = `is/was` → distractors `{are, were, have been}` — 10×
  - key = `base V` → distractors `{V-s, has V-en, is V-ing}` — 7×
  - key = `are/were` → distractors `{is, was, has been}` — 4×

The aspect variation (`are studying`, `has studied`, `have been`) exists so the option list *looks* like a tense question. It is not. **Two-word options are the norm** (39/44 items have a max option length of 2 words).


### B.2 Subject–verb agreement: how the subject is hidden (the number you asked for)

Hand-coded over all 43 clean F01 items (2 mislabels removed):

| Structure separating subject head from the verb slot | n | share |
|---|---|---|
| **Prepositional phrase** (`of / on / in / with / among …`) | **18** | **42%** |
| Appositive or supplementary phrase in paired commas | 16 | 37% |
| Restrictive/nonrestrictive **relative clause** | 8 | 19% |
| Participial (`-ing` / `-ed`) supplement | 4 | 9% |
| Reduced relative with no relative pronoun (`the toxins the organism uses …`) | 2 | 5% |
| Gerund/nonfinite **subject** (`Using one of these songs …`) | 2 | 5% |
| Locative **inversion** (`Among the clubs' leaders ___ Josephine …`) | 1 | 2% |
| Compound subject joined by *and* | 1 | 2% |
| **Nothing at all — subject adjacent to blank** | **6** | **14%** |

(Categories overlap; most Hard items stack two or three.)

**The decisive statistic.** In **28 of the 43** items (65%) — and in **28 of the 31** items (90%) that have any intervening material and are not simple relative-pronoun subjects — CB plants a noun of the **opposite number** between the true subject and the blank. In **22 of 37** non-relative items the noun sitting *immediately* before the blank is number-mismatched with the key. The trap is not "agreement"; the trap is **subject identification under a number-mismatched decoy**.

**Plural-looking singular subjects** (key is singular; something plural intervenes): 18 items. Canonical instances —
`the presence *of many fossilized microbacteria* … reinforces`; `Every last second *of space shuttle mission STS-79, which lasted ten days and three hours,* was`; `Using *one of these noncopyrighted songs* ensures`; `Alexander's use *of "we"* evokes`; `the shape of each statue's *ears*, like the shape of each person's *ears*, is`; `each one of a ghazal's *couplets*, while adhering to the *patterns of rhyme … opening lines (matla)*, is`; `The African **Games** Co-production **Market**, *one of over 180 annual international conferences*, promotes`; `A Sheaf Gleaned in French **Fields** (1876), *a volume of English translations of French poems*, has enhanced`; `The Proto-Nilotic language, *common ancestor of fifty-five African languages*, is`.

**Singular-looking plural subjects** (key is plural; something singular intervenes): 10 items. Canonical instances —
`speakers *of the English language* use`; `musings *on tenth-century Japanese courtly life* fascinate`; `The trailblazing accomplishments *of Goldin, winner of the 2023 Nobel Prize …,* attest`; `Objects *ranging from the Kikkoman soy sauce bottle to the Yamaha VMAX motorcycle to the Komachi bullet train* were`; `the toxins *the organism uses to protect itself from predation* actually increase`; `Barrada's pieces, *utilizing elements as disparate as … cotton balls dangling above a fan,* explore`; `The treaties, *which brought an end to the Thirty Years War,* were`; `many of whom, *like neuroscience and biophysics expert Elba Serrano,* study`.

Two further wrinkles worth copying: **(i)** in `f4fd123c` and `329255db` the *subject's own head-region contains a plural-looking word* ("African **Games** … Market", "French **Fields**") on top of a plural appositive — a double trap, both Hard. **(ii)** `28166dc6` uses a genuine compound subject *plus* a distributive supplement designed to pull singular: `The trefoil knot and the figure-eight knot, **each with a crossing number below five**, ___` → key `are`.


### B.3 Distractor architecture for the other FSS subtypes

**F03 finite vs nonfinite (36 items, 24% — the second-biggest FSS category and the one most under-taught).**
The blank sits where a *supplementary modifier* must go, and the item asks whether the slot takes a finite verb (which would create a second main clause and hence a comma splice or fragment) or a nonfinite form. Canonical quartet, appearing **8×** verbatim in shape: `{V-ed, V-ing, having V-en, to V}`. Key distribution: `to`-infinitive 8, bare `-ing` 6, base present 6, past tense 5, full clause 5.
Example (`a2816c7f`, Hard): *American abstract artist Richard \_\_\_ his installations to make passersby keenly aware …, assembles large-scale steel plates …* → A) `Serra is intending` B) `Serra, intends` C) **`Serra, intending`** D) `Serra intends`. The finite verbs are wrong not because of agreement but because the sentence already has a main verb ("assembles"). CB's rationale for these distractors is the flat phrase "**it results in an ungrammatical sentence**" — used 47 times.

**F02 tense/aspect sequencing (24 items, 16%).** Almost all Easy (20/24). The controlling evidence is a *tense already established in the neighbouring sentence*; the key just matches it. Distractor pool is dominated by **future** (17 occurrences) and **past perfect** (11) — forms that are almost never right. Modal quartet: `{V-s, is V-ing, will V, …}`.

**F06 subject-modifier placement / dangling modifier (17 items, 11%).** The hardest FSS family (12/17 Hard) and structurally unique: **all four options are full clauses of 7–23 words**, and the passage opens with a fronted participial/prepositional modifier followed by a comma and the blank. The *only* thing that varies is which noun phrase lands in subject position. CB names "**it results in a dangling modifier**" 38 times. Rule for the writer: exactly one option puts the modifier's logical subject first; the other three front an abstract nominalization (`the mitigation of …`, `pressure on lawmakers`), an expletive (`there are two problems …`), or a passive.

**F04 pronoun–antecedent (13 items, 9%).** Almost always a **bare four-pronoun list**: `{them, this, that, it}`, `{these, those, them, it}`, `{they, one, you, it}`. The pivot is number (plural antecedent → `they/them/these`; singular → `it/this`), plus a demonstrative-vs-personal contrast. 3 items are the `its / it's / their / they're` quartet.

**F05 possessives/plurals/contractions (11 items, 7%).** A **2×2 or 4×1 apostrophe grid**. Two shapes:
- pure contraction/determiner grid: `{its, it's, their, they're}` (3 items);
- the compound apostrophe grid, where two nouns each vary independently: `screw's thread's. / screws' threads. / **screw's threads.** / screws threads'.`; `photographer's early photo's / photographers early photo's / **photographer's early photos** / photographers early photos`; `it's two protagonists' / its two protagonist's / it's two protagonist's / **its two protagonists**`.
CB never asks for an apostrophe rule in isolation — it always crosses **singular-possessive × plural × plural-possessive** so that a student who knows only "apostrophe = possessive" has a 25% chance.


### B.4 Verbatim option sets by rule


##### F01 subject-verb agreement — verbatim option sets (n=44)

* `e38b3e4f` · Easy · key **A**
  > The radiation that _____ during the decay of radioactive atomic nuclei is known as g…
  - A) `occurs` **← KEY**
  - B) `have occurred`
  - C) `occur`
  - D) `are occurring`

* `db4e3819` · Easy · key **D**
  > …stic Trio, Alice Coltrane switches instruments, swapping the piano for the harp. With the same fluid style that Coltrane was famous for on piano, she _____ her fingers across the harp strings and creates a radiant s…
  - A) `sweep`
  - B) `are sweeping`
  - C) `were sweeping`
  - D) `sweeps` **← KEY**

* `e92a7ad3` · Easy · key **D**
  > In the Inca Empire (1438 – 1533), ayllus _____ family clans that ranged in size from small groups to thous…
  - A) `is`
  - B) `was`
  - C) `has been`
  - D) `were` **← KEY**

* `988c78eb` · Easy · key **C**
  > …and Indian activist and educator Hansa Mehta were instrumental in drafting the United Nations’ Universal Declaration of Human Rights, a document that _____ the basic freedoms to which all people are entitled.…
  - A) `have outlined`
  - B) `were outlining`
  - C) `outlines` **← KEY**
  - D) `outline`

* `4c06427b` · Medium · key **C**
  > …mical signals, is expanding because of innovative work by biomedical scientists — many of whom, like neuroscience and biophysics expert Elba Serrano, _____ this ’ mechanism to better understand how the body s neurol…
  - A) `is studying`
  - B) `has studied`
  - C) `study` **← KEY**
  - D) `studies`

* `a03008de` · Medium · key **A**
  > The Proto-Nilotic language, common ancestor of fifty-five African languages with similar linguistic properties, _____ like all protolanguages, hypothetical: there’s no direct ev…
  - A) `is,` **← KEY**
  - B) `are,`
  - C) `have been,`
  - D) `were,`

* `16740ab4` · Hard · key **B**
  > …, the presence of many fossilized microbacteria, which seem to have thrived there despite the extreme heat that persisted after the Chicxulub impact, _____ claims that bacteria are among the planet’s most resilient…
  - A) `have reinforced`
  - B) `reinforces` **← KEY**
  - C) `are reinforcing`
  - D) `reinforce`

* `505054e3` · Hard · key **C**
  > In the eastern Chinese city of Suzhou, known as a hub for silk manufacturing, a unique tradition of embroidery _____ back over two thousand years — one that includes iconic dou…
  - A) `dates`
  - B) `date`
  - C) `dating` **← KEY**
  - D) `has dated`


##### F02 verb tense / aspect sequencing — verbatim option sets (n=24)

* `3580533b` · Easy · key **A**
  > …ated new tools that quantify the overall well-being of a country’s citizens. Economists in India, for example, use an Ease of Living Index. This tool _____ economic potential, sustainability, and citizens’ quality o…
  - A) `measures` **← KEY**
  - B) `had measured`
  - C) `would have measured`
  - D) `will have been measuring`

* `7b419faf` · Easy · key **B**
  > …President Theodore Roosevelt on a scenic, sprawling trip through California’s Yosemite Valley. Upon returning from the three-day excursion, Roosevelt _____ to conserve the nation’s wilderness areas, a vow he upheld…
  - A) `is vowing`
  - B) `vowed` **← KEY**
  - C) `will vow`
  - D) `vows`

* `dbd78791` · Easy · key **A**
  > …that are only visible from certain locations during a total solar eclipse. When such an eclipse is imminent, the Sherpas pack up their telescopes and _____ ready.…
  - A) `get` **← KEY**
  - B) `had gotten`
  - C) `got`
  - D) `were getting`

* `2d6f8304` · Easy · key **B**
  > …Portugal produced 23,298 hg/ha. This is the type of information on global food production that the United Nations’ Food and Agriculture Organization _____ since 1945.…
  - A) `is collecting`
  - B) `has collected` **← KEY**
  - C) `will collect`
  - D) `collects`

* `ec08463d` · Easy · key **D**
  > Botanists recognize over fifty different species of sunflower. One species, the silverleaf sunflower, _____ both an early-flowering ecotype that tends to grow in coast…
  - A) `having included`
  - B) `including`
  - C) `to include`
  - D) `includes` **← KEY**

* `f40ca576` · Easy · key **D**
  > …starts to cool in the northern hemisphere, millions of North American monarch butterflies journey south. Searching for food and warmer habitats, they _____ thousands of miles — from as far north as Canada all the wa…
  - A) `flew`
  - B) `were flying`
  - C) `had flown`
  - D) `fly` **← KEY**

* `e2759b92` · Easy · key **D**
  > …icant part of modern-day Nigeria, the Kingdom of Benin was one of the major powers in West Africa between the thirteenth and nineteenth centuries. It _____ ruled by Oba Ewuare I from 1440 to 1473.…
  - A) `is`
  - B) `will be`
  - C) `has been`
  - D) `was` **← KEY**

* `1f8cd95f` · Medium · key **A**
  > …repurpose the company’s product, a nontoxic, clay-like substance for removing soot from wallpaper, as a modeling putty for kids. In addition, Zufall _____ selling the product under a child-friendly name: Play-Doh.…
  - A) `suggested` **← KEY**
  - B) `suggests`
  - C) `had suggested`
  - D) `was suggesting`


##### F03 finite vs nonfinite verb form — verbatim option sets (n=36)

* `36e89f74` · Easy · key **C**
  > …rn Wyoming, Devils Tower (also known as Bear Lodge) is one of the most prominent examples of columnar jointing, a pattern of fracturing in rocks that _____ in parallel arrays of long polygonal prisms.…
  - A) `resulting`
  - B) `were resulting`
  - C) `results` **← KEY**
  - D) `to result`

* `4aa28ac3` · Easy · key **D**
  > Nowadays, tug-of-war is usually seen as an informal game one might play at a picnic or in gym class. Surprisingly, the Olympic committee once decided _____ tug-of-war as an official Olympic event! Nations competed i…
  - A) `included`
  - B) `including`
  - C) `include`
  - D) `to include` **← KEY**

* `e3b72630` · Easy · key **D**
  > In the historical novel The Surrender Tree, Cuban American author Margarita Engle uses poetry rather than prose _____ the true story of Cuban folk hero Rosa La Bayamesa.…
  - A) `tells`
  - B) `told`
  - C) `is telling`
  - D) `to tell` **← KEY**

* `cf08e2fd` · Easy · key **B**
  > From 1912 to 1951, Charlotta Bass owned and operated the newspaper The California Eagle. While it was under Bass’s leadership, The Eagle _____ one of the US’s most influential Black-owned newspapers.…
  - A) `will become`
  - B) `became` **← KEY**
  - C) `is becoming`
  - D) `to become`

* `6d247c13` · Easy · key **A**
  > The Boston Saloon was one of the most popular African American – owned establishments in nineteenth-century Nevada. _____ by businessman William A.G. Brown, the saloon was known to…
  - A) `Created` **← KEY**
  - B) `Creates`
  - C) `Creating`
  - D) `Create`

* `175df826` · Easy · key **C**
  > In the 2011 documentary The Barber of Birmingham, civil rights activist James Armstrong recounts how his barbershop in Birmingham, Alabama, _____ as a political hub for members of the Black community durin…
  - A) `serving`
  - B) `having served`
  - C) `served` **← KEY**
  - D) `to serve`

* `f40b447c` · Medium · key **C**
  > …rounded by hazy swirls of blue and green paint, Zhang Daqian’s 1983 painting Panorama of Mount Lu is ü shanshui, a type of Chinese landscape painting _____ by the use of blue and green hues to depict ethereal, inspi…
  - A) `has been characterized`
  - B) `will be characterized`
  - C) `characterized` **← KEY**
  - D) `is characterized`

* `512f0ac9` · Hard · key **A**
  > …nners of the 2020 Nobel Prize in Chemistry —re-created and then reprogrammed the so-called “ genetic scissors ” of a species of DNA-cleaving bacteria _____ a tool that is revolutionizing the field of gene technology…
  - A) `to forge` **← KEY**
  - B) `forging`
  - C) `forged`
  - D) `and forging`


##### F04 pronoun-antecedent agreement — verbatim option sets (n=13)

* `8df848c1` · Easy · key **A**
  > …eventh century, table forks were met with much resistance. The Bishop of Ostia, St. Peter Damian, condemned the eating utensils because he considered _____ dangerous and unnecessary luxury items.…
  - A) `them` **← KEY**
  - B) `this`
  - C) `that`
  - D) `it`

* `166efaa2` · Easy · key **A**
  > …ive consumers a choice: for example, Japan achieved a 40 percent reduction in plastic-bag use after cashiers were instructed to ask customers whether _____ wanted a bag.…
  - A) `they` **← KEY**
  - B) `one`
  - C) `you`
  - D) `it`

* `0560b2b8` · Easy · key **D**
  > …aham Jones in the foreword to Never Whistle at Night: An Indigenous Dark Fiction Anthology. For Jones, dark fiction does more than entertain readers: _____ horror tropes to challenge familiar ways of knowing, blurri…
  - A) `one uses`
  - B) `we use`
  - C) `they use`
  - D) `it uses` **← KEY**

* `42cc9236` · Easy · key **D**
  > …his suits out of found objects, everything from ceramic birds to broken record players. He carefully considers the sound an object makes before using _____ in a suit.…
  - A) `this`
  - B) `that`
  - C) `these`
  - D) `it` **← KEY**

* `fff4c7f4` · Easy · key **A**
  > …y of her poems on scraps of paper, but she also took steps to collect these works. From 1858 to around 1864, for example, she copied more than 800 of _____ into forty homemade booklets (known as fascicles).…
  - A) `them` **← KEY**
  - B) `this`
  - C) `that`
  - D) `it`

* `c5d39bc7` · Easy · key **B**
  > …eve that, unlike most other species of barnacle, turtle barnacles (Chelonibia testudinari) can dissolve the cement-like secretions they use to attach _____ to a sea turtle shell, enabling the barnacles to move short…
  - A) `it`
  - B) `themselves` **← KEY**
  - C) `them`
  - D) `itself`

* `1448f43f` · Easy · key **C**
  > …tificial intelligence technologies. It involves training computer algorithms to organize unlabeled data sets. Multitask learning is another approach. _____ involves training computer models to perform multiple tasks…
  - A) `Those`
  - B) `They`
  - C) `It` **← KEY**
  - D) `Some`

* `9eb43963` · Medium · key **D**
  > …er in the North Atlantic Ocean is pushed eastward by powerful winds, but the rotation of Earth and interference from nearby landmasses together cause _____ to swirl into a massive, churning whirlpool — also called t…
  - A) `these`
  - B) `those`
  - C) `them`
  - D) `it` **← KEY**


##### F05 possessives / plurals / contractions — verbatim option sets (n=11)

* `b7363ba2` · Easy · key **A**
  > …t” to explain how seemingly minor events can have major impacts on future weather. According to Lorenz’s metaphor, the wind from a butterfly flapping _____ in Brazil might eventually grow into a storm elsewhere acro…
  - A) `its wings` **← KEY**
  - B) `its wings’`
  - C) `it’s wing’s`
  - D) `it’s wings’`

* `430d929a` · Easy · key **C**
  > …art for their 1953 paper announcing the double helix structure of DNA, but it is misleading to say that Watson and Crick discovered the double helix. _____ findings were based on a famous X-ray image of DNA fibers,…
  - A) `They’re`
  - B) `It’s`
  - C) `Their` **← KEY**
  - D) `Its`

* `1d971f75` · Easy · key **C**
  > Photographer Ansel Adams’s landscape portraits are iconic pieces of American art. However, many of the _____ of landscapes were intended not as art but as marketing; a…
  - A) `photographer’s early photo’s`
  - B) `photographers early photo’s`
  - C) `photographer’s early photos` **← KEY**
  - D) `photographers early photos`

* `2c49940e` · Medium · key **D**
  > …her Ren é Descartes doubted whether he could prove his own existence. Eventually, he found proof in his famous phrase I think, “ therefore I am.” The _____ complexity: only those who exist would be able to ponder th…
  - A) `phrases’ simplicity masks its`
  - B) `phrases simplicity masks their`
  - C) `phrase’s simplicity masks their`
  - D) `phrase’s simplicity masks its` **← KEY**

* `819c443d` · Medium · key **B**
  > …the desire for independence among the American colonists. After the colonies achieved their independence, Paine moved to Paris, where the provocative _____ would contribute to another revolution —the French Revoluti…
  - A) `authors political writings ’`
  - B) `author s political writings ’ ’` **← KEY**
  - C) `author s political writing s ’`
  - D) `authors political writings ’`

* `eeb14722` · Medium · key **D**
  > ’ The soundtrack to Mira Nair s 1991 film Mississippi Masala expressively captures the clashing of cultures that happens when _____ (a young Indian woman from Uganda and a young African Ameri…
  - A) `it s two protagonists ’`
  - B) `its two protagonist s ’ ’`
  - C) `it s two protagonist s`
  - D) `its two protagonists` **← KEY**

* `d2cf0e11` · Medium · key **C**
  > …created a prototype of the first flexible straw by inserting a screw into a paper straw and, using dental floss, binding the straw tightly around the _____ When the floss and screw were removed, the resulting corrug…
  - A) `screw’s thread’s.`
  - B) `screws’ threads.`
  - C) `screw’s threads.` **← KEY**
  - D) `screws threads’.`

* `8d53e7a0` · Medium · key **A**
  > ’ Slam poet Elizabeth Acevedo s debut novel The Poet X, winner of the 2018 National Book Award for Young People s Literature, is composed of ’ _____ protagonist, fifteen-year-old Xiomara Batista.…
  - A) `poems putatively written by the novel s ’ ’` **← KEY**
  - B) `poem s putatively written by the novel s ’ ’`
  - C) `poem s putatively written by the novels ’`
  - D) `poems putatively written by the novels ’`


##### F06 subject-modifier placement (dangling modifier) — verbatim option sets (n=17)

* `1684b237` · Easy · key **A**
  > One of the few African American global explorers during the turn of the 20th century, _____ …
  - A) `Matthew Henson made several treks across Greenland between 1891 and 1909.` **← KEY**
  - B) `1891 and 1909 were the years between which Matthew Henson made several treks across Greenland.`
  - C) `Greenland was where Matthew Henson made several treks between 1891 and 1909.`
  - D) `several treks across Greenland were made by Matthew Henson between 1891 and 1909.`

* `f1c5157d` · Medium · key **A**
  > Established in 1936 by African American novelist Richard Wright, _____ it would become a vital part of the creative movement known…
  - A) `the South Side Writers Group provided a valuable forum for Chicago writers to share ideas;` **← KEY**
  - B) `Chicago writers in the South Side Writers Group had a valuable forum for sharing ideas;`
  - C) `writers shared ideas at a valuable forum known as the South Side Writers Group in Chicago;`
  - D) `Chicago was where the South Side Writers Group provided a valuable forum for writers to share ideas;`

* `a14eef71` · Medium · key **D**
  > …COF) between two surfaces to the lowest possible level — superlubricity. A nearly frictionless (and, as its name suggests, extremely slippery) state, _____ …
  - A) `when their COF drops below 0.01, two surfaces reach superlubricity.`
  - B) `two surfaces, when their COF drops below 0.01, reach superlubricity. ’`
  - C) `reaching superlubricity occurs when two surfaces COF drops below 0.01. ’`
  - D) `superlubricity is reached when two surfaces COF drops below 0.01.` **← KEY**

* `8b017d4e` · Hard · key **D**
  > Supported by biochemical analyses of over 2,000 skeletons from the Middle Ages, _____ …
  - A) `vegetables and grains were, a 2022 study found, the primary components of early medieval rulers diets. ’`
  - B) `early medieval rulers diets were found, in a 2022 study, to have primarily consisted of vegetables and grains. ’`
  - C) `the primary components of early medieval rulers diets were vegetables and grains, according to a 2022 study. ’`
  - D) `findings from a 2022 study suggested that vegetables and grains were the primary components of early medieval rulers diets.` **← KEY**

* `f0864217` · Hard · key **A**
  > …drama performed annually in Rabinal, a town in the Guatemalan highlands. Based on events that occurred when Rabinal was a city-state ruled by a king, _____ had once been an ally of the king but was later captured wh…
  - A) `Rabinal Achí tells the story of K’iche’ Achí, a military leader who` **← KEY**
  - B) `K’iche’ Achí, the military leader in the story of Rabinal Achí,`
  - C) `the military leader whose story is told in Rabinal Achí, K’iche’ Achí,`
  - D) `there was a military leader, K’iche’ Achí, who in Rabinal Achí`

* `e060dd6b` · Hard · key **A**
  > Recordings of electrical activity in the brain, _____ increased activity in brain areas associated with suppressi…
  - A) `electrograms show that while responding to hypothetical match scenarios, the most highly skilled soccer players have` **← KEY**
  - B) `the most highly skilled soccer players responding to hypothetical match scenarios have electrograms that show`
  - C) `responses to hypothetical match scenarios show that the most highly skilled soccer players have electrograms with`
  - D) `hypothetical match scenario responses show that the most highly skilled soccer players captured in electrograms have`

* `dab8b8ee` · Hard · key **C**
  > …soil held together by surface-dwelling microorganisms such as fungi, lichens, and cyanobacteria. Fortifying soil in arid ecosystems against erosion, _____ …
  - A) `a recent study’s estimate is that these crusts reduce global dust emissions by 60 percent each year.`
  - B) `an estimated 60 percent reduction in global dust emissions each year is due to these crusts, according to a recent study.`
  - C) `these crusts reduce global dust emissions by an estimated 60 percent each year, according to a recent study.` **← KEY**
  - D) `a recent study has estimated that these crusts reduce global dust emissions by 60 percent each year.`

* `2bca654a` · Hard · key **D**
  > Forming extensive networks via mycorrhizal association — that is, a symbiotic relationship between plants and fungi — _____ …
  - A) `it is the entanglement of pine trees roots and the fungus Tricholoma matsutake s fungal hyphae that makes nutrient transport possible. ’ ’`
  - B) `the transport of nutrients is possible through the entanglement of pine trees roots and the fungus Tricholoma matsutake s fungal hyphae. ’ ’`
  - C) `nutrients can be transported through the entanglement of pine trees roots and the fungus Tricholoma matsutake s fungal hyphae.`
  - D) `pine trees and the fungus Tricholoma matsutake can transport nutrients through their entangled tree roots and fungal hyphae.` **← KEY**


##### F07 determiners (this/that/these/those) — verbatim option sets (n=2)

* `74253458` · Easy · key **A**
  > Cycads are palmlike plants with cones. _____ plants were abundant throughout the Mesozoic Era (66 to 252…
  - A) `These` **← KEY**
  - B) `That`
  - C) `Each`
  - D) `This`

* `e8926747` · Easy · key **D**
  > Eighteen letters written by Louisa May Alcott, author of the popular novel Little Women (1868), can be found at the New York Historical Society. _____ letters demonstrate Alcott’s keen business sense in her int…
  - A) `One`
  - B) `That`
  - C) `This`
  - D) `These` **← KEY**


##### F08 plural vs singular noun — verbatim option sets (n=2)

* `20ea68b7` · Medium · key **A**
  > It can take time for proposed amendments to the US Constitution to become law. For example, the Twenty-Second Amendment, which limits the number of _____ can serve, was first proposed in 1947 but wasn’t approved b…
  - A) `terms presidents` **← KEY**
  - B) `term’s presidents`
  - C) `term’s president’s`
  - D) `terms president’s`

* `dc645172` · Hard · key **D**
  > The artistic talents of Barbara Chase-Riboud, most known for her 1979 historical novel Sally Hemings and the conversation it inspired, _____ limited to the realm of prose: she first excelled in sculpt…
  - A) `hasn t been ’`
  - B) `wasn t ’ ’`
  - C) `isn t`
  - D) `aren t ’` **← KEY**


##### F99 unclassified (subject–verb, mislabelled by the rationale parser) — verbatim option sets (n=1)

* `ea0aa676` · Hard · key **D**
  > …s in Silent Valley, a pristine tropical forest in Kerala, India, that is home to nearly 1,000 species of native flora (many of which are endangered), _____ instrumental in the government’s decision to preserve the f…
  - A) `are`
  - B) `were`
  - C) `have been`
  - D) `was` **← KEY**



---

## C. HOW OFTEN IS A RULE REPEATED?

This was measured two ways: **observed** (rule-labelling every conventions item recoverable from the released practice tests) and **expected** (Monte-Carlo drawing from the bank's marginal rule distribution, 20,000 trials).

### C.1 Observed, in real released forms

| Form / module | conventions items recovered | rule repeats observed |
|---|---|---|
| Practice Test 2, Module 1 | 9 | 2× *verb tense*, 2× *possessives*, 2× *clause boundary* |
| Practice Test 2, Module 2 | 9 | **2× semicolons-in-a-complex-series**, 2× *supplementary element* |
| Practice Test 3, Module 1 | 6 | **3× clause boundary (2 main clauses)** |
| Practice Test 3, Module 2 | 10 | 2× *subject–verb agreement*, 2× *clause boundary*, 2× *supplementary element* |
| Practice Test 4, Module 1 | 7 | 2× *supplementary element* |

**Answer for authoring:** within a **single module** of ~8 conventions items, expect the **same rule family to recur 2–3 times**; across a **full 2-module form** (~16–18 conventions items) the dominant family (**clause boundary** or **supplementary element**) appears **3–5 times**. A form of 16 conventions items contains only **8–10 distinct rule families**, not 16. CB does **not** block rule repetition in conventions — repeats are the norm, and Practice Test 3 keys "two main clauses" five times in one form.

### C.2 Expected, from the bank marginals (sanity check)

| draw | P(at least one rule repeated) | modal max-repeat | modal # distinct rules |
|---|---|---|---|
| 4 Boundaries items | 0.69 | 2 | 3 |
| 8 Boundaries items | 1.00 | 3 | 5 |
| 4 FSS items | 0.76 | 2 | 3 |
| 8 FSS items | 1.00 | 3 | 4 |

The observed forms sit squarely on the expected curve, which confirms CB is sampling conventions rules **without** a no-repeat constraint. **Write your forms the same way**: sample from the marginal distribution below and let repeats happen.

**Target marginal for a synthetic 8-item conventions block (4 Boundaries + 4 FSS):**

| Boundaries | share | | FSS | share |
|---|---|---|---|---|
| B03 supplementary element | 27% | | F01 subject–verb agreement | 29% |
| B01 clause boundary | 26% | | F03 finite vs nonfinite | 24% |
| B07 no punctuation in a clause | 14% | | F02 tense sequencing | 16% |
| B11 declarative vs interrogative | 8% | | F06 subject-modifier placement | 11% |
| B04 restrictive modifier | 7% | | F04 pronoun–antecedent | 9% |
| B06 colon before explanation | 5% | | F05 possessives/plurals | 7% |
| B08 complex series | 4% | | F07/F08 determiners, plurals | 3% |
| B10 title + proper name | 3% | | | |
| B12 intro subordinate/participial | 3% | | | |
| B09 simple series | 2% | | | |
| B05 colon before list | 1% | | | |

### C.3 Transitions behave the OPPOSITE way

Across the six practice-test modules where the transitions block was recoverable, **no logical-relationship category was keyed twice in the same module, and no transition word was keyed twice in the same form.** Under random sampling from the bank's relationship distribution you would expect a repeat in **54%** of 4-item modules and **72%** of 5-item modules; observing zero repeats across six modules has p ≈ .05. **Transitions relationships are deliberately blocked; conventions rules are not.**


---


## D. TRANSITIONS

### D.1 Every transition KEYED across the 157-item sample, with counts

| relationship | n keyed | share | keyed transitions (count) |
|---|---|---|---|
| **CAUSE-RESULT** | 35 | 22.3% | *as a result* (10), *for this reason* (5), *therefore* (3), *hence* (3), *consequently* (3), *to that end* (2), *thus* (2), *in turn* (1), *in so doing* (1), *in response* (1), *in doing so* (1), *based on these models* (1), *as such* (1), *accordingly* (1) |
| **TEMPORAL** | 24 | 15.3% | *finally* (4), *then* (3), *next* (3), *previously* (2), *more often* (2), *later* (2), *sometimes* (1), *meanwhile* (1), *increasingly* (1), *in many cases* (1), *eventually* (1), *earlier* (1), *currently* (1), *again and again* (1) |
| **CONTRAST** | 23 | 14.6% | *however* (9), *by contrast* (7), *on the other hand* (2), *in contrast* (2), *conversely* (2), *undermining this explanation* (1) |
| **EMPHASIS** | 13 | 8.3% | *indeed* (5), *in fact* (4), *fittingly* (3), *actually* (1) |
| **CONCESSION** | 13 | 8.3% | *nevertheless* (3), *though* (2), *that said* (2), *still* (2), *of course* (2), *nonetheless* (1), *granted* (1) |
| **ADDITION** | 12 | 7.6% | *in addition* (4), *additionally* (4), *second* (2), *what’s more* (1), *moreover* (1) |
| **SIMILARITY** | 7 | 4.5% | *similarly* (3), *likewise* (2), *in comparison* (1), *by comparison* (1) |
| **PARTICULARIZATION** | 7 | 4.5% | *specifically* (6), *to be exact* (1) |
| **EXAMPLE** | 7 | 4.5% | *for example* (5), *for instance* (2) |
| **REPLACEMENT** | 6 | 3.8% | *instead* (4), *alternatively* (2) |
| **SUMMARY** | 5 | 3.2% | *ultimately* (5) |
| **RESTATEMENT** | 3 | 1.9% | *that is* (2), *in other words* (1) |
| **OTHER/PHRASAL** | 2 | 1.3% | *there* (1), *beyond the simple coining of a term* (1) |


### D.2 Every transition used as a DISTRACTOR, with counts

| relationship | n as distractor | share of 471 | transitions used (count) |
|---|---|---|---|
| **EXAMPLE** | 66 | 14.0% | *for example* (47), *for instance* (19) |
| **SIMILARITY** | 59 | 12.5% | *similarly* (30), *likewise* (19), *in comparison* (6), *by comparison* (3), *drawing a similar conclusion* (1) |
| **CAUSE-RESULT** | 58 | 12.3% | *thus* (13), *therefore* (13), *as a result* (12), *consequently* (8), *hence* (3), *for this reason* (3), *to that end* (2), *in turn* (1), *by achieving such a lofty goal* (1), *as such* (1), *accordingly* (1) |
| **CONCESSION** | 56 | 11.9% | *nevertheless* (26), *regardless* (12), *granted* (5), *that said* (4), *still* (3), *that being said* (1), *nonetheless* (1), *in any case* (1), *even so* (1), *all the same* (1), *admittedly* (1) |
| **ADDITION** | 56 | 11.9% | *in addition* (12), *moreover* (11), *additionally* (8), *furthermore* (7), *secondly* (3), *second* (3), *lastly* (3), *in the second place* (2), *firstly* (2), *second of all* (1), *in the first place* (1), *in addition to these factors* (1), *first of all* (1), *besides* (1) |
| **CONTRAST** | 54 | 11.5% | *however* (21), *by contrast* (9), *in contrast* (7), *on the contrary* (5), *on the other hand* (4), *conversely* (3), *ultimately limited in its lasting influence* (1), *further complicating these issues* (1), *despite these estimates* (1), *despite its creation of such an iconic trope* (1), *contrary to this phenomenon* (1) |
| **TEMPORAL** | 30 | 6.4% | *previously* (6), *next* (6), *earlier* (5), *meanwhile* (4), *today* (1), *subsequently* (1), *soon* (1), *nowadays* (1), *later* (1), *intermittently* (1), *finally* (1), *afterward* (1), *after* (1) |
| **RESTATEMENT** | 29 | 6.2% | *in other words* (26), *that is* (3) |
| **PARTICULARIZATION** | 20 | 4.2% | *specifically* (17), *in particular* (3) |
| **REPLACEMENT** | 20 | 4.2% | *instead* (14), *alternatively* (3), *rather* (2), *alternately* (1) |
| **SUMMARY** | 12 | 2.5% | *in conclusion* (8), *in sum* (2), *to conclude* (1), *in summary* (1) |
| **EMPHASIS** | 9 | 1.9% | *indeed* (4), *in fact* (2), *actually* (2), *in reality* (1) |
| **OTHER/PHRASAL** | 2 | 0.4% | *there* (1), *confirming this hypothesis* (1) |


### D.3 What CB keys vs what CB uses as bait — the single most useful table here

| relationship | % of KEYS (157) | % of DISTRACTORS (471) | ratio key:distractor |
|---|---|---|---|
| CAUSE-RESULT | **22.3%** | 12.3% | 1.8 |
| TEMPORAL / SEQUENCE | **15.3%** | 6.4% | 2.4 |
| CONTRAST | 14.6% | 11.5% | 1.3 |
| EMPHASIS / CONFIRMATION (*indeed, in fact, of course*) | **8.3%** | 1.9% | **4.3** |
| CONCESSION (*nevertheless, still, that said, granted*) | 8.3% | 11.9% | 0.7 |
| ADDITION | 7.6% | 11.9% | 0.6 |
| SIMILARITY (*similarly, likewise*) | 4.5% | **12.5%** | **0.36** |
| PARTICULARIZATION (*specifically, in particular*) | 4.5% | 4.2% | 1.1 |
| EXAMPLE (*for example, for instance*) | 4.5% | **14.0%** | **0.32** |
| REPLACEMENT (*instead, rather, alternatively*) | 3.8% | 4.2% | 0.9 |
| SUMMARY (*ultimately, in conclusion*) | 3.2% | 2.5% | 1.3 |
| RESTATEMENT (*in other words, that is*) | 1.9% | **6.2%** | **0.31** |
| CONDITION | 0% | 0% | — |

Read the ratio column. **CB keys cause-result and temporal far more than it uses them as bait; it uses *for example*, *similarly*, and *in other words* overwhelmingly as bait.** `for example` is the single most-used distractor in the corpus (47 appearances) but is keyed only 5 times; `similarly` appears 30 times as a distractor, keyed 3 times; `in other words` appears 26 times as a distractor and is keyed **once**. **Never write an item whose four options include *for example* unless you have deliberately engineered the preceding sentence to be a general claim that the blank sentence does *not* instantiate.**

Also note: **CONDITION is never tested.** No `if so`, `otherwise`, `in that case` appears anywhere as key or distractor. Drop it from the taxonomy.

### D.4 Is the same transition ever keyed twice in one form?

**No.** Across all six practice-test modules with a recoverable transitions block, zero repeated keyed words and zero repeated keyed relationships. Within the 157-item bank, the most-keyed items are *as a result* (10), *however* (9), *by contrast* (7), *specifically* (6) — but these are pooled across many forms.

Observed keyed sequences, in order, with difficulty:

| form | q# | key | relationship | difficulty |
|---|---|---|---|---|
| PT2 M2 | 27 / 28 / 29 / 30 | Meanwhile, / for example, / In addition, / Similarly, | TEMPORAL / EXAMPLE / ADDITION / SIMILARITY | Easy / Easy / Medium / Hard |
| PT3 M2 | 28 / 29 / 30 / 31 | Currently, / Second, / Thus, / Nevertheless, | TEMPORAL / ADDITION / CAUSE-RESULT / CONCESSION | Easy / Medium / Medium / Hard |
| PT4 M1 | 26 / 28 / 29 / 30 | Finally, / However, / In addition, / Therefore, | TEMPORAL / CONTRAST / ADDITION / CAUSE-RESULT | Easy / Easy / Easy / Medium |
| PT4 M2 | 27 / 28 | Therefore, / Alternatively, | CAUSE-RESULT / REPLACEMENT | Easy / Hard |
| PT5 M2 | 26 / 28 / 29 | Later, / For this reason, / That said, | TEMPORAL / CAUSE-RESULT / CONCESSION | Easy / Easy / Medium |

Three structural regularities fall out: **(i)** the transitions block is 2–5 items long and sits at **q26–q31** of a 33-item module, immediately before Rhetorical Synthesis; **(ii)** difficulty ramps monotonically inside the block — item 1 is Easy, the last is Hard; **(iii)** the *first* item in the block keyed TEMPORAL or CAUSE-RESULT in 5 of 5 observed blocks, and the *last* keyed CONCESSION, SIMILARITY, REPLACEMENT or CAUSE-RESULT — i.e. the hard slot is reserved for the relationships that are hardest to distinguish from their neighbours.

### D.5 Standard distractor architecture

- **The three distractors come from three *different* relationship categories in 144 of 157 items (92%).** Two-category distractor sets occur in 13 items (8%); a one-category set never occurs.
- **The key's own relationship category is duplicated among the distractors in only 4 of 157 items (3%).** So in 97% of items each of the four choices maps to a distinct logical relationship. This is the deep design rule: *a Transitions item is a four-way forced choice among four different logical relations, not a four-way choice among synonyms.*
- Which relations get paired with which key:

| KEY relationship | most frequent distractor relationships |
|---|---|
| CAUSE-RESULT (35) | CONCESSION 20, CONTRAST 19, EXAMPLE 19, SIMILARITY 14 |
| TEMPORAL (24) | SIMILARITY 11, CONTRAST 11, CAUSE-RESULT 10, EXAMPLE 10 |
| CONTRAST (23) | EXAMPLE 16, SIMILARITY 14, CAUSE-RESULT 12 |
| EMPHASIS (13) | ADDITION 9, CONCESSION 8, CONTRAST 5, REPLACEMENT 5 |
| CONCESSION (13) | CAUSE-RESULT 11, ADDITION 7, RESTATEMENT 6, SIMILARITY 6 |
| ADDITION (12) | EXAMPLE 7, REPLACEMENT 5, CONTRAST 4, CONCESSION 4 |
| PARTICULARIZATION (7) | CAUSE-RESULT 5, CONTRAST 5, CONCESSION 4 |
| EXAMPLE (7) | CONTRAST 4, CONCESSION 4, ADDITION 4 |
| SIMILARITY (7) | CAUSE-RESULT 3, EXAMPLE 3 |

The recurring skeleton is **{key} + {contrast-family} + {similarity-or-example} + {cause-result-or-addition}**. Modal full patterns: `CAUSE-RESULT → {CONCESSION, CONTRAST, EXAMPLE}` (6×) and `CONTRAST → {CAUSE-RESULT, EXAMPLE, SIMILARITY}` (5×).
- **Every keyed transition in all 157 items is followed by a comma.** No exceptions.


### D.6 Ten-plus verbatim option sets, key marked


##### KEY = CAUSE-RESULT (n=35)

* `04ad68ca` · Easy · key **D**
  > …re the Gothic era, cathedrals’ heavy ceilings had to be supported by thick, short walls, but the invention of flying buttresses eliminated this need. _____ Gothic cathedrals could be built with thinner, higher walls…
  - A) `Similarly,`
  - B) `For instance,`
  - C) `Nevertheless,`
  - D) `As a result,` **← KEY**

* `20e4ff59` · Easy · key **B**
  > …a Tower is a popular attraction in Bologna s city center. However, measurements taken in 2023 showed that the tower was rotating in a concerning way. _____ city officials closed the area around the tower so experts…
  - A) `Similarly,`
  - B) `As a result,` **← KEY**
  - C) `For example,`
  - D) `In comparison,`

* `bfab730e` · Easy · key **D**
  > …models to produce detailed Tyrannosaurus rex size estimates, incorporating factors such as growth rate, lifespan, and the size of available fossils. _____ the researchers determined that the largest T. rex possible…
  - A) `In addition to these factors,`
  - B) `Despite these estimates,`
  - C) `Further complicating these issues,`
  - D) `Based on these models,` **← KEY**

* `2b5e0731` · Easy · key **B**
  > With darkness falling, a mother elephant loses sight of her calf and wants to make sure it is safe. _____ she releases an infrasonic call for the calf to hear. Infra…
  - A) `For example,`
  - B) `For this reason,` **← KEY**
  - C) `Nowadays,`
  - D) `Similarly,`

* `1a8126aa` · Medium · key **A**
  > …opotamian clay tablet. When they tasted the dish, known as pa šrūtum (“unwinding”), they found that it had a mild taste and inspired a sense of calm. _____ the researchers, knowing that dishes were sometimes named a…
  - A) `Therefore,` **← KEY**
  - B) `Alternately,`
  - C) `Nevertheless,`
  - D) `Likewise,`

* `0839a4b9` · Medium · key **D**
  > …corded in seagrass beds with data that track rising carbon levels in the seagrass. As carbon levels increase, the audio is correspondingly distorted; _____ listeners can “ hear ” the changes in the carbon levels.…
  - A) `furthermore,`
  - B) `by comparison,`
  - C) `for instance,`
  - D) `thus,` **← KEY**


##### KEY = TEMPORAL (n=24)

* `e0bd4f8a` · Easy · key **B**
  > …he skilled work of nearly 4,000 African American ’ soldiers from US Army engineering regiments. The soldiers contribution was overlooked for decades. _____ in 2017, lawmakers declared October 25 a day of recognition…
  - A) `Lastly,`
  - B) `Then,` **← KEY**
  - C) `Similarly,`
  - D) `For example,`

* `47547d07` · Easy · key **C**
  > …rhead sea turtles will swim back to the sandy beaches where they were born to lay eggs of their own. First, the turtle will dig her nest in the sand. _____ she will lay up to 100 eggs in the nest. Finally, she will…
  - A) `By contrast,`
  - B) `Similarly,`
  - C) `Next,` **← KEY**
  - D) `For example,`

* `2bda9edb` · Easy · key **A**
  > …came a hero of the Asian American civil rights movement. In January of that year, she won an antidiscrimination case in the California Supreme Court. _____ in April, she wrote an open letter criticizing her local bo…
  - A) `Later,` **← KEY**
  - B) `For instance,`
  - C) `In other words,`
  - D) `Rather,`

* `6036ad0e` · Easy · key **C**
  > In 2014, Nestor Gomez won his first-ever storytelling competition, relating a tale about his life as a Guatemalan immigrant living in Chicago. _____ in 2017, Gomez created the show 80 Minutes Around the World…
  - A) `Instead,`
  - B) `For example,`
  - C) `Later,` **← KEY**
  - D) `In other words,`

* `28c7a762` · Medium · key **D**
  > …plit into different languages, many words evolved to sound very different than they had in their proto- language — ’ but this wasn t always the case. _____ words retained much of their original sound. The word “ ” f…
  - A) `However,`
  - B) `Moreover,`
  - C) `Thus,`
  - D) `Sometimes,` **← KEY**

* `2b08f514` · Hard · key **C**
  > …ime meridian, the global indicator of zero degrees longitude established in 1884, was originally determined using astronomically derived coordinates. _____ as decades passed, new calculations would reveal increasing…
  - A) `Specifically,`
  - B) `To that end,`
  - C) `Again and again,` **← KEY**
  - D) `Granted,`


##### KEY = CONTRAST (n=23)

* `20733eac` · Easy · key **C**
  > It has long been thought that humans first crossed a land bridge into the Americas approximately 13,000 years ago. _____ based on radiocarbon dating of samples uncovered in Mexico,…
  - A) `As a result,`
  - B) `Similarly,`
  - C) `However,` **← KEY**
  - D) `In conclusion,`

* `64bcdf3d` · Easy · key **D**
  > …posing effects on tropical cyclones. On ’ one hand, the dust can enhance the formation of ice clouds in the cyclone s core, increasing precipitation. _____ the dust can lower sea surface ’ temperatures around the cy…
  - A) `Previously,`
  - B) `In other words,`
  - C) `For example,`
  - D) `On the other hand,` **← KEY**

* `bfb4e85e` · Easy · key **B**
  > …as accomplished a lot. She has appeared on Broadway, toured with Prince, and even served on the President s ’ Council on Sports, Fitness & Nutrition. _____ according to Copeland, nothing in her career matches the ho…
  - A) `Thus,`
  - B) `However,` **← KEY**
  - C) `For example,`
  - D) `Second of all,`

* `c4f7f726` · Easy · key **D**
  > Many butterfly species have bold, brightly colored wings. _____ some butterfly species have wings that are almost completel…
  - A) `Similarly,`
  - B) `Previously,`
  - C) `In other words,`
  - D) `However,` **← KEY**

* `af89fa02` · Medium · key **C**
  > …much during his forty-year reign. He conquered all of Mesopotamia and built Babylon into one of the most powerful cities of the ancient world. Today, _____ he is mainly remembered for a code of laws inscribed on a s…
  - A) `therefore,`
  - B) `likewise,`
  - C) `however,` **← KEY**
  - D) `for instance,`

* `080a7b51` · Medium · key **A**
  > Imagine a magazine that a reader has thrown away. This magazine is post-consumer waste, as it became waste after reaching the consumer. _____ the paper scraps left over from printing the magazine are p…
  - A) `By contrast,` **← KEY**
  - B) `For example,`
  - C) `As a result,`
  - D) `Specifically,`


##### KEY = EMPHASIS (n=13)

* `97e2e364` · Easy · key **B**
  > …imagery, bitingly satiric tone, and dexterous use of traditional Acholi song and phraseology, the poem inspired a generation of East African writers. _____ those who adopted its style are often referred to as Okot S…
  - A) `Nevertheless,`
  - B) `Fittingly,` **← KEY**
  - C) `By comparison,`
  - D) `Instead,`

* `fc2bcc79` · Easy · key **A**
  > …ent civilization located in present-day Lebanon). The Phoenicians were famous for using this natural dye to color their clothes a distinctive purple. _____ the name “ Phoenicia ” itself, some historians claim, may h…
  - A) `In fact,` **← KEY**
  - B) `Regardless,`
  - C) `Lastly,`
  - D) `On the contrary,`

* `0fd4df40` · Easy · key **A**
  > The Alaska Native Language Archive (ANLA) is known for its impressive audio collection. _____ the ANLA has more than 5,000 audio recordings of Native Ala…
  - A) `In fact,` **← KEY**
  - B) `After,`
  - C) `Regardless,`
  - D) `Instead,`

* `ec3d7605` · Medium · key **D**
  > …avel writer Linda Watanabe McFerrin considers the background research she conducts on destinations featured in her travel books to be its own reward. _____ McFerrin admits to finding the research phase of her work j…
  - A) `By contrast,`
  - B) `Likewise,`
  - C) `Besides,`
  - D) `In fact,` **← KEY**

* `b7c404d1` · Medium · key **C**
  > …stallation The Interstitium, Iranian American artist Laleh Mehran succeeded in creating a space that felt, as intended, both “ familiar and distant.” _____ with a video screen placed at the far end of the coal slag-…
  - A) `Next,`
  - B) `Nevertheless,`
  - C) `Indeed,` **← KEY**
  - D) `Instead,`

* `a266d876` · Hard · key **C**
  > …bserved reaching the ionosphere. The extreme altitudes involved (the ionosphere begins about 80 km above Earth) mark these gigantic jets as outliers; _____ the majority of jets reach heights of only 20 to 50 km.…
  - A) `nevertheless,`
  - B) `consequently,`
  - C) `indeed,` **← KEY**
  - D) `in addition,`


##### KEY = CONCESSION (n=13)

* `ff1a2e5e` · Easy · key **D**
  > Historians agree that the jazz pianist Jelly Roll Morton was exaggerating when he claimed to have invented jazz music. No one can deny, _____ ’ that Morton s innovative compositions and remarkable impr…
  - A) `therefore,`
  - B) `in the second place,`
  - C) `in other words,`
  - D) `though,` **← KEY**

* `fb56b593` · Medium · key **C**
  > …test stars in the sky, ranking 23rd. Although ’ not as bright as Shaula, the star Alkaid also ranks among the 50 brightest stars (40th, to be exact). _____ Alkaid s brightness is likely due to the ’ star s relative…
  - A) `Indeed,`
  - B) `As a result,`
  - C) `Granted,` **← KEY**
  - D) `Similarly,`

* `f8c4591b` · Medium · key **D**
  > …steeply sloping sides, the volcanoes Hverfjall (Iceland) and Toliman (Guatemala) may look similar from afar. Tehnuka Ilanko and other volcanologists, _____ can tell by how each was formed that Hverfjall is a cinder…
  - A) `for example,`
  - B) `in addition,`
  - C) `therefore,`
  - D) `though,` **← KEY**

* `4fde4454` · Medium · key **D**
  > …r the first 1960 presidential debate suggested that John Kennedy lost badly: only 21 percent of those who listened on the radio rated him the winner. _____ the debate was ultimately considered a victory for the tele…
  - A) `In other words,`
  - B) `Therefore,`
  - C) `Likewise,`
  - D) `Nevertheless,` **← KEY**

* `5e93039f` · Medium · key **C**
  > …water shoots up 100 feet or more from Yellowstone s Old Faithful geyser before plunging back to the surface — a cycle seemingly inhospitable to life. _____ as microbiologist Eric Boyd attests, “ … the geyser is almo…
  - A) `Thus,`
  - B) `Specifically,`
  - C) `Still,` **← KEY**
  - D) `In other words,`

* `9dc4e640` · Hard · key **C**
  > …cannot be distinguished by the naked eye or even under a microscope. The crystals in microcrystalline minerals are also not visible to the naked eye; _____ they can usually be seen under a microscope.…
  - A) `thus,`
  - B) `for example,`
  - C) `that said,` **← KEY**
  - D) `similarly,`


##### KEY = ADDITION (n=12)

* `660d50dc` · Easy · key **A**
  > …est African father and an English mother, Coleridge-Taylor emphasized his mixed-race ancestry. For example, he referred to himself as Anglo- African. _____ he incorporated the sounds of traditional African music int…
  - A) `In addition,` **← KEY**
  - B) `Actually,`
  - C) `However,`
  - D) `Regardless,`

* `b6ebadf6` · Easy · key **D**
  > There are three basic steps you should follow when planning a scientific inquiry. First, thoroughly research the question you wish to answer. _____ come up with a prediction (also called a hypothesis) about…
  - A) `Therefore,`
  - B) `Instead,`
  - C) `For example,`
  - D) `Second,` **← KEY**

* `d9dad012` · Medium · key **C**
  > The Inca of South America used intricately knotted string devices called quipus to record countable information, like population data and payments. _____ they may have used quipus to record more complex informatio…
  - A) `As a result,`
  - B) `In other words,`
  - C) `In addition,` **← KEY**
  - D) `For example,`

* `129089b5` · Medium · key **D**
  > …tion was ratified. The amendment mandates that presidential inaugurations be held on January 20, approximately ten weeks after the November election. _____ this amendment requires newly elected US senators and repre…
  - A) `Instead,`
  - B) `For instance,`
  - C) `Specifically,`
  - D) `In addition,` **← KEY**

* `2b5f4bdc` · Medium · key **A**
  > …ed States border. As a reporter for the Texas newspaper La Cró ’ nica, she voiced support for the Mexican people s revolt against authoritarian rule. _____ she founded the League of Mexican Women, a group that advoc…
  - A) `Additionally,` **← KEY**
  - B) `In conclusion,`
  - C) `For example,`
  - D) `Rather,`

* `8fbf206d` · Hard · key **B**
  > …ogist Anne Varichon uses vivid prose to describe various systems and tools that have been used over ’ the past few centuries for categorizing colors. _____ Varichon s book features many high-quality images of these…
  - A) `Consequently,`
  - B) `Additionally,` **← KEY**
  - C) `That said,`
  - D) `Specifically,`


##### KEY = SIMILARITY (n=7)

* `6a5939c2` · Easy · key **B**
  > …ts, but recent research suggests that they may have actually lived in savannas. Tropical forests are humid and have many trees spaced close together. _____ savannas are drier, and their trees are spaced further apar…
  - A) `For instance,`
  - B) `In comparison,` **← KEY**
  - C) `Firstly,`
  - D) `In conclusion,`

* `1c36e3e1` · Easy · key **D**
  > The number of dark spots that appear on the Sun, known as sunspots, can vary greatly. For example, there were about 180 sunspots in November 2001. _____ there were only about 2 sunspots in December 2008.…
  - A) `In other words,`
  - B) `Similarly,`
  - C) `Therefore,`
  - D) `By comparison,` **← KEY**

* `30438650` · Medium · key **C**
  > …about romantic relationships. In “ This Blessed House, ” newlyweds argue over whether to replace items left by the previous owners of their new home. _____ in “A Temporary Matter, ” a husband and wife attempt to rek…
  - A) `Granted,`
  - B) `For example,`
  - C) `Likewise,` **← KEY**
  - D) `Hence,`

* `fd24f48f` · Medium · key **C**
  > …activists across the state sold tea to promote the cause of suffrage. In San Francisco, the Woman’s Suffrage Party sold Equality Tea at local fairs. _____ in Los Angeles, activist Nancy Tuttle Craig, who ran one of…
  - A) `For example,`
  - B) `To conclude,`
  - C) `Similarly,` **← KEY**
  - D) `In other words,`

* `29ae4d48` · Medium · key **D**
  > In the early 1970s, Albert Popa took up graffiti art, spraying his work onto what was at the time an unconventional surface: concrete. _____ Albert’s son David has chosen an unusual canvas for his new…
  - A) `However,`
  - B) `Indeed,`
  - C) `Second,`
  - D) `Likewise,` **← KEY**

* `d54e16ee` · Medium · key **C**
  > …psony” can also refer to markets where demand for labor is limited. In a product monopsony, the single buyer can force sellers to lower their prices. _____ in a labor monopsony, employers can force workers to accept…
  - A) `Earlier,`
  - B) `Instead,`
  - C) `Similarly,` **← KEY**
  - D) `In particular,`


##### KEY = PARTICULARIZATION (n=7)

* `8a1ad52b` · Medium · key **B**
  > …d by Gal Badihi has discovered that chimpanzees communicate through exchanges of gestures occurring at a pace similar to that of human conversations. _____ chimpanzee gesture exchanges have short pauses of about 120…
  - A) `As a result,`
  - B) `Specifically,` **← KEY**
  - C) `By contrast,`
  - D) `Nevertheless,`

* `60917233` · Medium · key **D**
  > ’ In the 1880s, inventor Lewis Latimer improved upon Thomas Edison s design for the electric light bulb. _____ Latimer made the light bulb more durable by placing cardboa…
  - A) `Soon,`
  - B) `Regardless,`
  - C) `However,`
  - D) `Specifically,` **← KEY**

* `0c0d50e1` · Medium · key **A**
  > …er almost one million homes. As its name indicates, the project — currently in development —consists of wind turbines located off the Virginia coast. _____ the project plan calls for 176 large turbines to be placed…
  - A) `To be exact,` **← KEY**
  - B) `In conclusion,`
  - C) `As a result,`
  - D) `In contrast,`

* `0f9ed134` · Medium · key **B**
  > …od Rowland discovered that chemicals called CFCs were harmful to the ozone layer. Their research was extremely influential in the fight against CFCs. _____ it laid the foundation for a 1987 treaty that phased out th…
  - A) `Regardless,`
  - B) `Specifically,` **← KEY**
  - C) `However,`
  - D) `Earlier,`

* `9e3a215b` · Medium · key **D**
  > …22 study by researchers Hala Altamimi and Qiaozhen Liu investigated the relationship between nonprofit arts organizations spending and ’ performance. _____ the researchers examined the correlation between how much 2…
  - A) `Thus,`
  - B) `In addition,`
  - C) `By comparison,`
  - D) `Specifically,` **← KEY**

* `8622320e` · Medium · key **A**
  > ’ Earth s auroras —colorful displays of light seen above the northern and southern poles — ’ result, broadly speaking, from the Sun s activity. _____ the ’ Sun releases charged particles that are captured by E…
  - A) `Specifically,` **← KEY**
  - B) `Similarly,`
  - C) `Nevertheless,`
  - D) `Hence,`


##### KEY = EXAMPLE (n=7)

* `db8fe023` · Easy · key **D**
  > A potter choosing which type of clay to use for a piece considers two key factors: the desired look of the piece and its intended use. _____ earthenware clay is often used for decorative pieces becaus…
  - A) `In other words,`
  - B) `Regardless,`
  - C) `In conclusion,`
  - D) `For example,` **← KEY**

* `827afb27` · Easy · key **A**
  > …niferophyta) are evergreen. That is, they keep their green leaves or needles year-round. However, not all conifer species are evergreen. Larch trees, _____ lose their needles every fall.…
  - A) `for instance,` **← KEY**
  - B) `nevertheless,`
  - C) `meanwhile,`
  - D) `in addition,`

* `fc5e83cc` · Easy · key **C**
  > …gers like soprano Ana María Martínez take vocal directions from descriptive notations, typically in Italian, that appear alongside the musical notes. _____ these descriptive terms might guide the performer to sing g…
  - A) `On the other hand,`
  - B) `All the same,`
  - C) `For example,` **← KEY**
  - D) `In the second place,`

* `4f2710ab` · Easy · key **B**
  > …anisms have evolved a number of surprising adaptations to ensure their survival in adverse conditions. Tadpole shrimp (Triops longicaudatus) embryos, _____ can pause development for over ten years during extended pe…
  - A) `in contrast,`
  - B) `for example,` **← KEY**
  - C) `meanwhile,`
  - D) `consequently,`

* `e965fd73` · Easy · key **B**
  > Preston Singletary is a Tlingit glass artist who often collaborates with other artists. _____ he has worked with Tewa pottery artist Jody Naranjo several…
  - A) `In conclusion,`
  - B) `For example,` **← KEY**
  - C) `However,`
  - D) `In comparison,`

* `f07570bb` · Medium · key **B**
  > …are from a Spanish cargo ship that was lost in 1697. Stories passed down among the area’s Confederated Tribes of Siletz Indians support this belief. _____ Siletz stories describe how blocks of beeswax, an item the…
  - A) `For this reason,`
  - B) `For example,` **← KEY**
  - C) `However,`
  - D) `Likewise,`


##### KEY = REPLACEMENT (n=6)

* `9d4f331c` · Easy · key **B**
  > …ght the advice of engineer Gustave Eiffel. Eiffel suggested ’ ’ that he make the statue s arm thick and position it straight above the figure s head. _____ Bartholdi decided to slim the arm and tilt it out at an ang…
  - A) `Additionally,`
  - B) `Instead,` **← KEY**
  - C) `Thus,`
  - D) `For example,`

* `d3725911` · Easy · key **D**
  > In the search for extraterrestrial life, astrobiologists Stuart Bartlett and Michael L. Wong propose that scientists avoid using the term “ ” life. _____ researchers should use another word: “ ” lyfe. This new ter…
  - A) `Previously,`
  - B) `Regardless,`
  - C) `There,`
  - D) `Instead,` **← KEY**

* `be44fea0` · Medium · key **B**
  > …ast Asia, University of Georgia researchers wondered if the spiders’ rapid spread throughout the southeastern US was a result of aggressive behavior. _____ they discovered that jor ō spiders are gentle giants who re…
  - A) `Therefore,`
  - B) `Instead,` **← KEY**
  - C) `For example,`
  - D) `In other words,`

* `9502ec65` · Hard · key **A**
  > When soil becomes contaminated by toxic metals, it can be removed from the ground and disposed of in a landfill. _____ contaminated soil can be detoxified via phytoremediation: p…
  - A) `Alternatively,` **← KEY**
  - B) `Specifically,`
  - C) `For example,`
  - D) `As a result,`

* `70c19cf6` · Hard · key **B**
  > …work of physicist Theodore von K ármán, this line marks the theoretical height at which an aircraft no longer remains aloft using the force of lift. _____ an aircraft sustains flight past this altitude primarily by…
  - A) `For instance,`
  - B) `Instead,` **← KEY**
  - C) `Granted,`
  - D) `Regardless,`

* `e225cf02` · Hard · key **B**
  > …rchers observed several female wood ducks visiting dozens of nesting sites and laying eggs to be incubated by other nesting A. sponsa. Subject 7F64B, _____ visited a select few nesting sites before laying and incuba…
  - A) `in particular,`
  - B) `alternatively,` **← KEY**
  - C) `for example,`
  - D) `similarly,`


##### KEY = SUMMARY (n=5)

* `00221c00` · Easy · key **B**
  > …t Latin American nations seeking independence from Spain might achieve something similar. The letter was addressed to a local merchant, Henry Cullen; _____ though, Bolívar’s goal was to persuade political leaders fr…
  - A) `additionally,`
  - B) `ultimately,` **← KEY**
  - C) `accordingly,`
  - D) `consequently,`

* `e1079609` · Easy · key **B**
  > …’ encompassed the entire state, but as Iowa s population grew, this single district began to struggle to serve the needs of everyone in the state. ’ _____ the court s jurisdiction was subdivided into two districts,…
  - A) `Nevertheless,`
  - B) `Ultimately,` **← KEY**
  - C) `Additionally,`
  - D) `For example,`

* `37ec26e7` · Easy · key **A**
  > …Positioning System (GPS), scientists had to develop an accurate mathematical model of Earth’s shape that accounted for various forces, such as tides. _____ it was mathematician Gladys West who wrote the computer pro…
  - A) `Ultimately,` **← KEY**
  - B) `In other words,`
  - C) `Secondly,`
  - D) `In addition,`

* `6e0c60da` · Hard · key **C**
  > …ne looks at the dark craggy vistas in Hitoshi Fugo’s evocative photo series, one’s mind might wander off to the cratered surfaces of faraway planets. _____ it’s the series’ title, Flying Frying Pan, that brings one…
  - A) `Consequently,`
  - B) `Alternatively,`
  - C) `Ultimately,` **← KEY**
  - D) `Additionally,`

* `332e75bf` · Hard · key **B**
  > …imagining a horde of goldfish laying and eating their own eggs — Dillard struggles to reconcile the complicated juxtapositions of the natural world. _____ ’ nature s mesmerizing intricacy and pitiless harshness pro…
  - A) `To that end,`
  - B) `Ultimately,` **← KEY**
  - C) `Moreover,`
  - D) `Hence,`


##### KEY = RESTATEMENT (n=3)

* `2df7b582` · Medium · key **C**
  > …re the ultimate source of knowledge. Aristotle disagreed, positing that knowledge is best obtained through direct engagement with the material world; _____ sensory experience of the material is the ultimate source o…
  - A) `regardless,`
  - B) `admittedly,`
  - C) `in other words,` **← KEY**
  - D) `meanwhile,`

* `7c3f0145` · Medium · key **D**
  > …sis of 200 terms, researchers found a broad pattern of valence-dependent mutation for which negative words saw a faster rate of cognate replacement — _____ the rate at which a word will be replaced over time with a…
  - A) `for example,`
  - B) `likewise,`
  - C) `in addition,`
  - D) `that is,` **← KEY**

* `e3edc138` · Hard · key **D**
  > In a heated debate in biogeography, the field is divided between dispersalists and vicariancists. _____ there are those who argue that dispersal is the most crucia…
  - A) `Furthermore,`
  - B) `By contrast,`
  - C) `Similarly,`
  - D) `That is,` **← KEY**


##### KEY = OTHER/PHRASAL (n=2)

* `991e849a` · Easy · key **C**
  > Mary Anning (1799 – ’ 1847), one of the world s first paleontologists, lived in Lyme Regis along the Jurassic Coast of southern England. _____ she made several important discoveries, including some of t…
  - A) `For example,`
  - B) `Likewise,`
  - C) `There,` **← KEY**
  - D) `Later,`

* `7dbcb7f4` · Medium · key **A**
  > …nre, and the English language, by introducing the term “ robot ” (derived from the Czech word robota, meaning “ indentured labor ” or “ ” drudgery ). _____ Č ’ apek s play also contributed to a venerable literary an…
  - A) `Beyond the simple coining of a term,` **← KEY**
  - B) `By achieving such a lofty goal,`
  - C) `Ultimately limited in its lasting influence,`
  - D) `Despite its creation of such an iconic trope,`



### D.7 Structural setup of the sentence around the blank

Measured on all 157 items:

| feature | value |
|---|---|
| Blank sits at the **start of a sentence** | **130 / 157 = 83%** |
| Blank sits mid-sentence after `,` `;` `:` | 24 / 157 = 15% |
| Blank sits mid-sentence with no preceding mark | 3 / 157 = 2% |
| All four options capitalized (= sentence-initial) | 132 / 157 = 84% |
| Complete sentences of context **before** the blank-bearing sentence | 1 sentence: 53%; 2 sentences: 41%; 3+: 5%; 0: 1% |
| Sentences **after** the blank | exactly 1: 83%; 2: 17% |
| Total passage length | median **57 words** (Q1 50, Q3 61; range 27–80) |
| Words before the blank | median **33** (Q1 25, Q3 41) |

**Canonical geometry: two sentences of set-up, then `______` opening the third-and-final sentence, whole passage ≈ 55–60 words.** In the 15% mid-sentence cases the blank follows a semicolon joining two clauses (`…the audio is correspondingly distorted; ______ listeners can "hear" the changes…`) or sits after a comma inside a clause.

**How the relationship is made inferable.** In **121 of 157 items (77%) there is no explicit connective anywhere in the prior context.** The relation must be computed from propositional content alone. When a connective *is* present (36 items, 23%) it is almost always `but` (12) or `however` (7) inside the *set-up* sentence, where its job is to establish the local contrast that the blank then extends or reverses — never to signal the answer. The keyed transition's own wording appears earlier in the passage exactly **once in 157 items**.

The four content mechanisms CB uses to make the relation recoverable, in order of frequency:
1. **State a condition/discovery, then state its consequence.** (`…the invention of flying buttresses eliminated this need. ______ Gothic cathedrals could be built with thinner, higher walls.`) → CAUSE-RESULT.
2. **Date-stamp or event-order the two sentences.** (`In 1926 … / ______ in 1948 …`) → TEMPORAL. Recognisable because both sentences carry explicit time expressions.
3. **State an expectation, then state the finding that violates it.** (`Most planets discovered outside our solar system orbit … ______ KELT-9b orbits a B-type star.`) → CONTRAST or CONCESSION.
4. **State a general claim, then state a numerically precise version of the same claim.** (`…pauses between chimpanzee gestures are short. ______ they average about 120 milliseconds, comparable to the 200-millisecond average in human speech.`) → PARTICULARIZATION (*specifically*), **not** EXAMPLE. This distinction — restating the *same* fact more precisely vs. giving *one instance of a class* — is the single most commonly exploited confusion in the corpus.


---

## E. TRAP MECHANICS — what each item is engineered to punish

Each subsection names (a) the surface heuristic a weak student runs, (b) how each distractor pays that heuristic off, and (c) the counter-heuristic the item is actually testing.

### E.1 BOUNDARIES

**The heuristic being punished: "punctuate where I would pause when reading aloud."** Prosodic breaks occur after long subjects, after fronted prepositional phrases, before infinitives of purpose, and before appositives — none of which take punctuation in Standard English. CB's Easy and Medium Boundaries items are built almost entirely on this mismatch.

Distractor-by-distractor payoff, using the modal `NONE`-key quartet (`{key: no punctuation} + {COLON, COMMA, DASH}` or `+ {COLON, COMMA, SEMI}`, 21 items, 12 of them Easy):

| distractor | heuristic it rewards |
|---|---|
| `word,` | "there's a breath here" / "long subject → comma before the verb" (17 items name *no punctuation between subject and verb*) |
| `word:` | "a list/explanation follows, so use a colon" — the student never checks whether what precedes is an **independent clause** (31 items carry this distractor) |
| `word —` | "a dash is a stylish general-purpose pause" — the student never checks for a **matching** dash (18 items carry an unmatched-pair distractor) |
| `word;` | "a semicolon is a strong comma" — the student never checks for **two main clauses** (23 items) |

**The clause-boundary family (26% of items) punishes a second heuristic: "a conjunction or a comma is enough to join sentences."** The canonical quartet is engineered so that every wrong answer is a *named* error:
`fibers,` = **comma splice** · `fibers but` = **run-on / missing comma before a coordinating conjunction joining long clauses** · `fibers` = **fused run-on** · **`fibers, but`** = key.
The student who has only learned "FANBOYS join clauses" picks `fibers but`; the student who has only learned "commas separate ideas" picks `fibers,`; the student who reads for meaning and hears no pause picks `fibers`. Across 150 items, 43 contain a comma-splice distractor and 42 contain a run-on distractor. **These two errors are the load-bearing wrong answers of the entire domain.**

**The Hard Boundaries mechanism is different and mechanical: paired-mark matching.** The passage already prints *one* mark of a pair — an opening dash, an opening parenthesis, a comma before the supplement — somewhere the student is not looking, often 15+ words away or on the *far side* of the blank. The blank supplies the closing mark. Distractors offer the three non-matching marks. Example (`c15069eb`, Hard): the passage already contains `— the last of which…` **after** the blank, so the blank must both close the preceding clause and introduce a list: A) **`competitions, however:`** B) `competitions, however,` C) `competitions, however;` D) `competitions; however,`. Every distractor is a *locally* plausible way to punctuate a conjunctive adverb; only one is globally consistent. The punished heuristic is **local scanning** — reading only the words adjacent to the blank.

**The `B07`/`B10` family punishes "a proper name is extra information, so set it off."** `Entomologist Heather Grab ___ found` and `American geologist ___ Marie Tharp` and `the chemical compound ___ aluminum oxide` all key **no punctuation**, because the name is a *restrictive* appositive. Distractors offer `,` (nonrestrictive reading), `,…,` (paired), and `:` (introduction). CB's rationale: "*'Marie Tharp' is essential information that completes the first clause — the first clause doesn't function without it.*" This tests whether the student can ask "is the preceding noun phrase already uniquely identifying?" — 5 items, **all 5 tagged Hard**.

### E.2 FORM, STRUCTURE, AND SENSE

**The heuristic being punished: "agree the verb with the nearest noun."** This is the whole of the F01 design. As shown in §B.2, 90% of the F01 items with any intervening material place a number-mismatched noun between the true subject and the blank, and in 22 of 37 non-relative items that mismatched noun is the *last word before the blank*. The three distractors are all in the opposite number (39/44 items), which means **the nearest-noun heuristic sends the student into a bloc of three wrong answers, all of which "sound right."** The aspect variation (`are studying` / `has studied` / `have been`) exists purely so the student who has already lost the number decision cannot recover it by noticing that the options differ on some other axis.

Secondary trap inside F01: **a plural-looking word inside the subject itself.** `The African **Games** Co-production Market … promotes` and `A Sheaf Gleaned in French **Fields** (1876) … has enhanced` reward the student who scans for the nearest `-s`.

**F03 punishes "a verb slot needs a finite verb."** The blank sits where a *supplement* belongs, and the sentence already has its main verb — often 15–25 words later. `Serra is intending` / `Serra, intends` / **`Serra, intending`** / `Serra intends`: the two finite options produce a comma splice or a two-main-verb monstrosity; only the participle forms a modifier. Because the main verb sits *after* the supplement, the student who reads left-to-right and stops at the blank has no way to detect the error. **The item punishes not-reading-to-the-end-of-the-sentence.** CB's flat rationale — "it results in an ungrammatical sentence," 47 uses — confirms there is no subtler principle involved.

**F06 punishes "the modifier modifies whatever the sentence is about."** All four options are full clauses; the only difference is which noun phrase is in subject position. Distractors front (i) an abstract nominalization of the right idea (`the bioswales' mitigation of…`, `pressure on lawmakers`), (ii) an expletive (`there are two problems associated with…`), (iii) a passive that demotes the logical subject (`the alkaloid physostigmine was synthesized by Julian…`). Each is *semantically* the same claim, which is exactly the point: the student who checks meaning rather than syntax cannot discriminate. 12 of 17 are Hard.

**F05 punishes "apostrophe = possession."** The grid crosses singular-possessive × plural × plural-possessive × (sometimes) contraction, so that knowing only the apostrophe-means-possessive rule leaves all four options looking defensible: `screw's thread's.` / `screws' threads.` / **`screw's threads.`** / `screws threads'.` Two independent number decisions must be made, and the *second* noun in the pair is usually the one that is plain plural — the shape students are least likely to choose because it has no apostrophe at all.

**F04 punishes "pick the pronoun that sounds least awkward."** With bare four-pronoun lists (`them / this / that / it`) there is no syntax to reason about; the student must have actually tracked the antecedent's number across a sentence boundary. Note that `it` appears as an option in 11 of 13 items and is keyed in 5 — CB deliberately makes the singular the *available* answer often enough that "never pick `it`" fails.

### E.3 TRANSITIONS

**The heuristic being punished: "match the transition to the surface topic rather than to the logical relation."** Because 97% of items give four *different* relations, no two options are interchangeable — so the student who cannot compute the relation has no fallback. The three distractors are chosen so that each one is defensible under a *partial* reading of the passage:

| distractor slot | the partial reading it rewards |
|---|---|
| **EXAMPLE** (*for example*, 47 uses — the most-used distractor) | "sentence 2 is more concrete than sentence 1, so it must be an example." Punishes failure to distinguish **one instance of a class** from **the same claim stated more precisely** (which is *specifically*) or **the consequence of the claim** (which is *as a result*). |
| **SIMILARITY** (*similarly*/*likewise*, 49 uses) | "both sentences are about the same topic." Punishes topic-matching instead of relation-matching. Because CB passages are single-topic by construction, *similarly* is *always* topically plausible and *usually* logically wrong. |
| **RESTATEMENT** (*in other words*/*that is*, 29 uses, **keyed only 3 times in total, *in other words* just once**) | "sentence 2 repeats sentence 1 in easier words." Punishes failure to notice that sentence 2 adds new information. |
| **CONCESSION** (*nevertheless*, *regardless*, *still*, *granted*, 56 uses) | "there is some tension in the passage." Punishes reading a contrast that exists between sentence 1 and *background expectation* rather than between sentence 1 and sentence 2. |
| **CAUSE-RESULT** (*thus*, *therefore*, 58 uses) | "sentence 2 comes after sentence 1, so it follows from it." Punishes conflating **sequence** with **consequence** — which is exactly why TEMPORAL is the second-most-keyed relation (15.3%) and CAUSE-RESULT the most-used bait after EXAMPLE. |

CB's own distractor rationales confirm the mechanism verbatim: "*this choice uses a disagreement transition*" (11×), "*this choice uses a transition that indicates the addition of an agreeing idea*" (4×), "*'similarly' illogically signals that the information in this sentence is similar to the previous information*", "*'therefore' illogically signals that the information in this sentence is a result of the previous information*". Every rejection is stated as a **mismatch of relation**, never as a register or collocation problem.

**The deepest trap is the *specifically* / *for example* / *in other words* triangle.** These three are near-synonyms in student usage but are formally distinct: *for example* requires sentence 2 to be **an instance of a class named in sentence 1**; *specifically* requires sentence 2 to be **the same proposition at higher resolution**; *in other words* requires sentence 2 to add **no** new information. CB keys *specifically* 6 times, *for example*/*for instance* 7 times, *in other words* once — while using them as distractors 17, 66, and 26 times respectively. **An item writer who wants a hard Transitions item should build exactly this triangle and key the one whose entailment relation actually holds.**

**Difficulty is created structurally, not lexically.** Easy items (66/157) put the relation between two adjacent sentences with an explicit causal or temporal verb. Hard items (32/157) do one of three things: (i) place the blank mid-sentence after a semicolon, so the student must relate two *clauses* rather than two sentences; (ii) key a low-frequency relation whose distractors include a high-frequency plausible one (`Alternatively,` keyed against `Specifically, / For example, / As a result,`); (iii) require the relation to be computed across **two** prior sentences rather than one (the 41% of items with two set-up sentences).

---

## F. AUTHORING CHECKLIST (derived)

**Boundaries item.** Pick a rule from the §C.2 marginal. Write a 45–70 word passage. Put the blank at a clause or phrase junction. Build the option set as a **shape sweep**, not a content sweep — the four options must be the same words with four different punctuation states, or two paired-mark states crossed with two positions. Guarantee that at least one distractor is a *named* error (comma splice, run-on, colon-after-fragment, unmatched pair). Put the key at C or D 62% of the time. Do not vary wording between options unless the rule is B11 (word order × terminal mark) or B01 with a conjunction.

**FSS item.** Pick from the §C.2 marginal. If subject–verb: choose the subject's number first (65% singular), then insert **one** number-mismatched noun between the subject head and the blank — a prepositional phrase 42% of the time, an appositive in paired commas 37% — and make all three distractors the opposite number, varying aspect. Keep options to **two words**. If finite/nonfinite: place the sentence's real main verb *after* the blank and build the `{V-ed, V-ing, having V-en, to V}` quartet. If modifier placement: front a participial modifier, comma, blank; make all four options full clauses differing only in subject position, and use a nominalization, an expletive, and a passive as the three distractors.

**Transitions item.** Two set-up sentences (~35 words), then the blank opening the final sentence, total ~57 words, key followed by a comma. Choose the keyed relation from the §D.3 distribution (cause-result 22%, temporal 15%, contrast 15%, emphasis 8%). Choose the three distractors from **three different** relations — one from the contrast/concession family, one from the example/similarity/restatement family, one from cause-result/addition. Do not repeat a relation within a module. Do not print a connective in the set-up that gives away the relation; make it inferable from the propositions alone (77% of real items have no connective in the prior context at all).
