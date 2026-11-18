const fs=require('fs'),vm=require('vm'),assert=require('assert');
function boot(start=true){const elements=new Map(),storageCalls=[];
 const element=()=>({innerHTML:'',textContent:'',disabled:false,open:false,classList:{toggle(){}},setAttribute(){},children:[],append(child){this.children.push(child)},scrollIntoView(){},showModal(){this.open=true},close(){this.open=false},addEventListener(){},focus(){}});
 const document={documentElement:{setAttribute(){}},querySelectorAll(){return []},querySelector(s){if(s==='dialog[open]')return null;if(!elements.has(s))elements.set(s,element());return elements.get(s)},createElement:element,addEventListener(){}};
 const context={document,requestAnimationFrame:fn=>{fn();return 0},matchMedia:()=>({matches:false}),localStorage:{getItem(){throw Error('Old progress must not be read')},setItem(){throw Error('Progress must not be persisted')},removeItem(k){storageCalls.push(k)}},console};context.window=context;vm.createContext(context);
 for(const f of ['levels.js','engine.js','i18n.js','effects.js','icon-sprites.js','app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
 if(start)elements.get('#startLanguages').children[0].onclick();
 return {run:s=>vm.runInContext(s,context),elements,storageCalls};}
const app=boot();assert.deepEqual(app.storageCalls,['pantori-demo-v1']);
app.run("choose('redI');place(1,5)");assert.equal(app.run('Object.keys(placements()).length'),1);
app.elements.get('#clear').onclick();assert.equal(app.run('Object.keys(placements()).length'),0);assert.equal(app.run('selected'),null);assert.equal(app.run('hover'),null);
app.elements.get('#undo').onclick();assert.equal(app.run('Object.keys(placements()).length'),1);
const reopened=boot();assert.equal(reopened.run('Object.keys(placements()).length'),0);assert.equal(reopened.run('state.index'),0);
assert(app.run("levels.every(l=>l.image.endsWith('.png'))"));
const html=fs.readFileSync('index.html','utf8');assert(html.includes('id="clear"'));for(const id of ['check','hint','reset'])assert(!html.includes(`id="${id}"`));
console.log('PASS: clear all, undo clear, fresh reopen, legacy save removed, original PNG maps, removed options stay removed.');

app.run("choose('redI');draw()");assert(!app.elements.get('#placedLayer').innerHTML.includes('data-piece="redI"'));
for(const lang of ['pl','en','de','fr','es','it']){app.run(`lang='${lang}';languageUI();renderBoardLabels();renderTools();draw()`);assert.equal(app.run('selected'),'redI');assert.equal(app.run('Object.keys(placements()).length'),1);}
app.run("choose('redI');draw()");assert(!app.elements.get('#placedLayer').innerHTML.includes('opacity="0.5"'));
console.log('PASS: moving piece hidden, six languages, switching language preserves board and selection.');
const translated=boot();const dict=translated.run('dictionaries');const expected=Object.keys(dict.pl).sort();for(const [code,d]of Object.entries(dict)){assert.deepEqual(Object.keys(d).sort(),expected);for(const [k,v]of Object.entries(d))assert(v.length>0,code+':'+k);}
const page=fs.readFileSync('index.html','utf8');for(const match of page.matchAll(/data-i18n="([^"]+)"/g))assert(dict.pl[match[1]],match[1]);
translated.run(fs.readFileSync('solutions.js','utf8'));
for(let i=0;i<3;i++){translated.run(`state.index=${i};render();lang='fr';for(const p of Object.values(PANTORI_SOLUTIONS[level().id])){choose(p.id);shape=p.cells;place(p.x+shape[0][0],p.y+shape[0][1]);}`);assert.equal(translated.elements.get('#win').open,true);assert(translated.run('state.complete.includes(level().id)'));translated.elements.get('#win').close();}
console.log('PASS: every translation key complete; all three levels auto-complete with translated victory messages.');

const guide=boot();assert(guide.elements.get('#rules').open);assert.equal(guide.elements.get('#guideExit').textContent,'Rozpocznij grę');
for(let i=1;i<7;i++){guide.elements.get('#guideNext').onclick();assert.equal(guide.run('guideIndex'),i);}
assert(guide.elements.get('#guideNext').disabled);guide.elements.get('#guideExit').onclick();assert(!guide.elements.get('#rules').open);guide.run("choose('redI');place(1,5)");guide.elements.get('#rulesBtn').onclick();assert.equal(guide.run('guideIndex'),0);assert.equal(guide.elements.get('#guideExit').textContent,'Wróć do gry');guide.elements.get('#guideExit').onclick();assert.equal(guide.run('Object.keys(placements()).length'),1);
console.log('PASS: startup guide, sequential slides, last-step boundary, start/back labels, board preserved.');

const touch=boot();const board=touch.elements.get('#board');
touch.elements.get('#grid').getBoundingClientRect=()=>({left:0,top:0,width:800,height:800});
board.setPointerCapture=()=>{};board.hasPointerCapture=()=>true;board.releasePointerCapture=()=>{};
const ev=(x,y)=>({pointerType:'touch',pointerId:1,isPrimary:true,clientX:x,clientY:y,preventDefault(){}});
touch.run("touchMode=true;choose('redI')");
board.onpointerdown(ev(150,450));board.onpointermove(ev(150,550));board.onpointerup(ev(150,550));
assert.equal(touch.run('Object.keys(placements()).length'),0);assert.deepEqual(touch.run('hover'),[1,5]);assert(touch.elements.get('#previewLayer').innerHTML.includes('stroke-dasharray'));
touch.elements.get('#rotate').onclick();touch.elements.get('#flip').onclick();assert.deepEqual(touch.run('hover'),[1,5]);assert.equal(touch.run('Object.keys(placements()).length'),0);
touch.run("shape=E.normalize(defs.redI.cells)");board.onpointerdown(ev(150,550));board.onpointerup(ev(150,550));assert.equal(touch.run('Object.keys(placements()).length'),1);
touch.run('suppressClickUntil=0');touch.elements.get('#grid').children[41].onclick({pointerType:'touch',detail:1});assert.equal(touch.run('selected'),'redI');assert(!touch.elements.get('#placedLayer').innerHTML.includes('data-piece="redI"'));
const before=touch.run('JSON.stringify(placements())');board.onpointerdown(ev(150,550));board.onpointermove(ev(350,350));board.onpointercancel(ev(350,350));assert.equal(touch.run('JSON.stringify(placements())'),before);assert.equal(touch.run('touchGesture'),null);
console.log('PASS: touch drag previews only, rotate/flip retain preview, tap commits, pickup hides previous shape, cancellation preserves board.');

const precision=boot(),pb=precision.elements.get('#board');
precision.elements.get('#grid').getBoundingClientRect=()=>({left:10,top:20,width:320,height:320});
pb.setPointerCapture=()=>{};pb.hasPointerCapture=()=>true;pb.releasePointerCapture=()=>{};
precision.run("touchMode=true;choose('redI');hover=[1,5];draw()");
// Grab the middle square: the anchor must not jump to the finger.
pb.onpointerdown(ev(70,280));assert.deepEqual(precision.run('hover'),[1,5]);
pb.onpointermove(ev(91,280));assert(Math.abs(precision.run('floating[0]')-1.525)<.001);assert.deepEqual(precision.run('hover'),[2,5]);
pb.onpointerup(ev(91,280));assert.equal(precision.run('Object.keys(placements()).length'),0);assert.equal(precision.run('floating'),null);
precision.elements.get('#confirm').onclick();assert.equal(precision.run('placements().redI.x'),2);assert.equal(precision.run('placements().redI.y'),5);
// Pick up a lower square of an already placed piece without moving it.
precision.run('suppressClickUntil=0');precision.elements.get('#grid').children[58].onclick({pointerType:'touch',detail:1});assert.deepEqual(precision.run('hover'),[2,5]);assert.equal(precision.run('selected'),'redI');
// Rotating near the bottom keeps the preview within the board.
precision.run("hover=[7,7]");precision.elements.get('#rotate').onclick();assert(precision.run('E.cells(proposed(...hover)).every(c=>c.every(v=>v>=0&&v<8))'));
// Device wording switches in every supported language, including tutorial.
for(const code of ['pl','en','de','fr','es','it']){
 precision.run(`lang='${code}';touchMode=true`);
 for(const key of ['selectHelp','rotateHelp','guideControls','startMsg'])assert.equal(precision.run(`t('${key}')`),precision.run(`dictionaries[lang]['${key}Touch']`));
 assert(!/Space|spacja|klawisz|clic droit|Rechtsklick|Leertaste|Espacio|Spazio|right.click|PPM/.test(precision.run("t('guideControls')+' '+t('rotateHelp')")));
 precision.run('touchMode=false');assert.equal(precision.run("t('rotateHelp')"),precision.run('dictionaries[lang].rotateHelpMouse'));
}
console.log('PASS: 320px board, no grip jump, sub-cell preview, snap after release, explicit confirm, edge clamping, six-language device copy.');

const traps=boot();
traps.run("choose('redI');place(0,3)");
assert(traps.elements.get('#featureLayer').innerHTML.includes('data-retracted="2,1"'));
traps.run("choose('redI')");traps.elements.get('#remove').onclick();assert(!traps.elements.get('#featureLayer').innerHTML.includes('data-retracted'));
traps.elements.get('#undo').onclick();assert(traps.elements.get('#featureLayer').innerHTML.includes('spikes-retracted.png'));
traps.elements.get('#clear').onclick();assert(!traps.elements.get('#featureLayer').innerHTML.includes('data-retracted'));
traps.run("state.index=2;render();choose('yellowI');shape=E.rotate(shape);place(3,3)");assert(traps.elements.get('#featureLayer').innerHTML.includes('data-retracted="2,3"'));
traps.run("state.index=1;render()");assert(!traps.elements.get('#featureLayer').innerHTML.includes('data-retracted'));
const events=boot();events.run("let hits=[];FX.invalid=()=>hits.push('invalid');FX.placement=()=>hits.push('placed');FX.win=()=>hits.push('win');choose('redI');place(0,0)");assert.equal(events.run('hits.join()'),'invalid');assert.equal(events.run('Object.keys(placements()).length'),0);
events.run("place(1,5)");assert.equal(events.run('hits.join()'),'invalid,placed');
events.run("state.boards[level().id]={};for(const id of level().pieces)placements()[id]={id,color:defs[id].color,cells:defs[id].cells,x:0,y:0};checkAutomatically()");assert.equal(events.run('lastMessage.error'),true);assert(events.run('lastMessage.args.errors.length')>0);
console.log('PASS: retract/restore traps on both maps, remove/undo/clear, invalid-placement FX, valid placement FX and explanatory incomplete-map messages.');

const legality=boot();
legality.run("choose('redI');hover=[0,0];drawPreview()");
assert(legality.elements.get('#previewLayer').innerHTML.includes('url(#invalidHatch)'));
assert(legality.elements.get('#previewLayer').innerHTML.includes('#df625d'));
assert(legality.elements.get('#previewLayer').innerHTML.includes('stroke="#797982"'));
assert.equal(legality.elements.get('#feedback').textContent,'Mur musi pozostać odkryty.');
assert.equal(legality.elements.get('#feedback').hidden,false);
legality.run('hover=[1,4];drawPreview()');assert.equal(legality.elements.get('#feedback').hidden,true);
legality.run('place(1,4)');assert.equal(legality.elements.get('#feedback').hidden,true);
legality.run("const emptyMap={size:8,walls:[],ghosts:[]};const unit=(id,x,y)=>({id,color:'red',cells:[[0,0]],x,y});");
assert(legality.run("E.validPlacement(emptyMap,unit('c',2,2),[unit('a',1,2),unit('b',3,2)])"));
assert(legality.run("E.validPlacement(emptyMap,unit('c',3,2),[unit('a',2,2),unit('b',1,2)])"));
assert.equal(legality.run("E.validPlacement(emptyMap,unit('c',2,2),[unit('a',1,1),unit('b',3,3)])"),null);
assert.equal(legality.run("E.validPlacement(emptyMap,{id:'c',color:'red',cells:[[0,0],[1,0],[2,0]],x:2,y:2},[unit('a',1,2),unit('b',5,2)])"),null);
console.log('PASS: gray hatching preserves tile color; preview explains invalid placement; routine messages hidden; segment contact checked for new and existing pieces; corner and separate-segment contacts allowed.');

const contactFix=boot();contactFix.run("level().walls=[];level().ghosts=[];choose('redI');place(2,3);choose('yellowI');hover=[1,3];drawPreview()");
assert(contactFix.elements.get('#previewLayer').innerHTML.includes('url(#invalidHatch)'));
assert.equal(contactFix.elements.get('#feedback').textContent,'Dwa klocki mogą stykać się tylko jednym wspólnym bokiem.');
contactFix.run('place(1,3)');assert.equal(contactFix.run('Object.keys(placements()).length'),1);
const ghosts=boot();assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('ghost-sprite awake'));
ghosts.run("choose('redI');place(1,3)");assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('filter="url(#ghostGray)"'));
ghosts.run("choose('redI')");assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
ghosts.elements.get('#remove').onclick();assert(!ghosts.elements.get('#ghostLayer').innerHTML.includes('data-caught="true"'));
ghosts.elements.get('#undo').onclick();assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
ghosts.elements.get('#clear').onclick();assert(!ghosts.elements.get('#ghostLayer').innerHTML.includes('data-caught="true"'));
console.log('PASS: adjacent long edges rejected before placement, gray hatch and reason; caught ghosts stop and gray out; pickup preserves state, remove/undo/clear restore correct ghost state.');

const fruitMotion=boot();assert(fruitMotion.elements.get('#fruitLayer').innerHTML.includes('fruit-sprite bouncing'));
fruitMotion.run("choose('redI');place(1,4)");assert(fruitMotion.elements.get('#fruitLayer').innerHTML.includes('data-fruit="1,6" data-collected="true"'));
assert(fruitMotion.elements.get('#placedLayer').innerHTML.includes('fill-opacity="0.6384"'));
fruitMotion.elements.get('#undo').onclick();assert(!fruitMotion.elements.get('#fruitLayer').innerHTML.includes('data-collected="true"'));
fruitMotion.run("choose('redI');place(0,3)");assert(fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active="0,4"'));assert(fruitMotion.elements.get('#featureLayer').innerHTML.includes('assets/lever-left.png'));
fruitMotion.run("choose('redI')");fruitMotion.elements.get('#remove').onclick();assert(!fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active'));
fruitMotion.elements.get('#undo').onclick();assert(fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active'));
fruitMotion.elements.get('#clear').onclick();assert(!fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active'));
console.log('PASS: fruit motion stops on collection and resumes after undo; active lever artwork follows placement/remove/undo/clear; placed tile fill opacity increased by 33%.');

const intro=boot(false);assert(intro.elements.get('#languageStart').open);assert(!intro.elements.get('#rules').open);assert.equal(intro.elements.get('#startLanguages').children.length,6);intro.elements.get('#startLanguages').children[1].onclick();assert.equal(intro.run('lang'),'en');assert(!intro.elements.get('#languageStart').open);assert(intro.elements.get('#rules').open);intro.run('state.index=1;render()');assert(!intro.elements.get('#languageStart').open);
const scrolling=boot();scrolling.run('touchMode=true');scrolling.elements.get('#board').onpointerdown({pointerType:'touch',isPrimary:true,preventDefault(){throw Error('Scroll blocked')}});assert.equal(scrolling.run('touchGesture'),null);
scrolling.run('state.index=1;render()');assert(scrolling.elements.get('#diamondLayer').innerHTML.includes('sparkling'));scrolling.run("state.boards[level().id]={redI:{id:'redI',color:'red',x:6,y:2,cells:[[0,0]]}};draw()");assert(scrolling.elements.get('#diamondLayer').innerHTML.includes('data-diamond="6,2" data-collected="true"'));assert(scrolling.elements.get('#diamondLayer').innerHTML.includes('filter="url(#ghostGray)"'));
console.log('PASS: language picker precedes tutorial, does not reopen on next map; unselected map permits scrolling; collected diamond becomes gray.');

const centering=boot();centering.run('touchMode=true;window.innerHeight=800;window.scrollY=0;window.scrollTo=o=>window.lastScroll=o');centering.elements.get('#board').getBoundingClientRect=()=>({top:200,height:320});centering.elements.set('.tool-panel',{getBoundingClientRect:()=>({top:560})});centering.elements.get('#guideExit').onclick();assert.equal(centering.run('window.lastScroll.top'),80);console.log('PASS: mobile map centers above fixed controls after tutorial.');

const discard=boot();discard.run("choose('redI');place(1,5)");const saved=discard.run('JSON.stringify(placements())'),undoCount=discard.run('history.length');discard.run("touchMode=true;choose('yellowI');hover=[3,3];floating=[3.2,3];draw()");assert.equal(discard.elements.get('#remove').disabled,false);discard.elements.get('#remove').onclick();assert.equal(discard.run('JSON.stringify(placements())'),saved);assert.equal(discard.run('history.length'),undoCount);for(const name of ['selected','shape','hover','floating','touchGesture'])assert.equal(discard.run(name),null);assert.equal(discard.elements.get('#previewLayer').innerHTML,'');assert(discard.elements.get('#remove').disabled);discard.elements.get('#undo').onclick();assert.equal(discard.run('Object.keys(placements()).length'),0);
const edgeGuide=boot();edgeGuide.elements.get('#guideNext').onclick();assert.equal(edgeGuide.elements.get('#guideImage').src,'assets/rules-edge.gif');assert(edgeGuide.elements.get('#guideDescription').textContent.includes('krawędzią'));edgeGuide.elements.get('#animationToggle').onclick();assert.equal(edgeGuide.elements.get('#guideImage').src,'assets/rules-edge.png');console.log('PASS: discard unplaced tile clears hand without changing board or undo history; edge tutorial GIF and paused image.');
