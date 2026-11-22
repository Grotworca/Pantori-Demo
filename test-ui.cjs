const fs=require('fs'),vm=require('vm'),assert=require('assert');
function boot(start=true){const elements=new Map(),storageCalls=[];
 const element=()=>({dataset:{},getBoundingClientRect:()=>({left:0,top:0,width:800,height:800}),setPointerCapture(){},releasePointerCapture(){},hasPointerCapture(){return true},innerHTML:'',textContent:'',disabled:false,open:false,classList:{toggle(){}},setAttribute(){},children:[],append(child){this.children.push(child)},scrollIntoView(){},showModal(){this.open=true},close(){this.open=false},addEventListener(){},focus(){}});
 const document={documentElement:{setAttribute(){}},querySelectorAll(){return []},querySelector(s){if(s==='dialog[open]')return null;if(!elements.has(s))elements.set(s,element());return elements.get(s)},createElement:element,addEventListener(){}};
 const context={document,requestAnimationFrame:fn=>{fn();return 0},matchMedia:()=>({matches:false}),localStorage:{getItem(){throw Error('Old progress must not be read')},setItem(){throw Error('Progress must not be persisted')},removeItem(k){storageCalls.push(k)}},console};context.window=context;vm.createContext(context);
 for(const f of ['levels.js','engine.js','i18n.js','effects.js','icon-sprites.js','interaction-i18n.js','piece-drag.js','tutorial.js','app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
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

const guide=boot();assert(guide.elements.get('#rules').open);assert(guide.elements.get('#guideNext').disabled);
guide.elements.get('#guideNext').onclick();assert.equal(guide.run('guideIndex'),0);
const solutions=[
 [['redI',0,1]], [['redI',2,0]], [['redI',0,0],['blueL',1,1]],
 [['redI',0,0],['blueL',1,1]], [['redI',0,0],['blueL',1,1]],
 [['redI',0,0],['blueL',1,1]], [['redI',0,1]], [['redI',0,2,'rotate']], [['blueS',0,0,'flip']]
];
for(let i=0;i<solutions.length;i++){
 assert.equal(guide.run('guideIndex'),i);assert.equal(guide.run('lessonSolved()'),false);
 for(const [id,x,y,transform]of solutions[i]){
  guide.run(`lessonChoose('${id}');${transform?`lessonShape=E.${transform}(lessonShape);`:''}lessonHover=[${x}+lessonShape[0][0],${y}+lessonShape[0][1]];lessonPlace()`);
 }
 assert(guide.run('lessonSolved()'),`lesson ${i} not solvable`);
 assert.equal(guide.run('Object.keys(placements()).length'),0);
 if(i<solutions.length-1){assert(!guide.elements.get('#guideNext').disabled);guide.elements.get('#guideNext').onclick();}
}
assert(guide.elements.get('#guideNext').disabled);
guide.elements.get('#guideExit').onclick();assert(!guide.elements.get('#rules').open);
guide.run("choose('redI');place(1,5)");const expedition=guide.run('JSON.stringify(state)');guide.elements.get('#rulesBtn').onclick();guide.run("lessonChoose('redI');lessonHover=[0,1];lessonPlace()");guide.elements.get('#guideExit').onclick();assert.equal(guide.run('JSON.stringify(state)'),expedition);
console.log('PASS: all 9 interactive exercises solvable, Next gated, reset on reopening, expedition preserved.');

const ev=(x,y,type='touch',target=null)=>({pointerType:type,pointerId:1,button:0,isPrimary:true,clientX:x,clientY:y,target:target||{closest:()=>null},preventDefault(){}});
const touch=boot(),board=touch.elements.get('#board');
touch.run("touchMode=true;choose('redI');hover=[1,4]");
board.onpointerdown(ev(150,450));board.onpointermove(ev(150,550));board.onpointerup(ev(150,550));
assert.equal(touch.run('placements().redI.y'),5);assert.equal(touch.run('selected'),null);
assert(!html.includes('id="confirm"'));
// Native swipe on an unselected touch map must not start a drag.
board.onpointerdown({...ev(150,550),preventDefault(){throw Error('scroll blocked')}});assert(!touch.run('gameDrag.active()'));
// Pick up, keep grip offset and drop using mouse.
board.onpointerdown(ev(150,650,'mouse'));board.onpointermove(ev(250,650,'mouse'));board.onpointerup(ev(250,650,'mouse'));
assert.equal(touch.run('placements().redI.x'),2);assert.equal(touch.run('placements().redI.y'),5);
// Invalid release keeps a preview, including blinking wrapper and X marks.
touch.run("choose('redI');hover=[2,5]");board.onpointerdown(ev(250,550));board.onpointermove(ev(50,50));board.onpointerup(ev(50,50));
assert.equal(touch.run('placements().redI.x'),2);assert.equal(touch.run('selected'),'redI');
assert(touch.elements.get('#previewLayer').innerHTML.includes('invalid-preview'));assert(touch.elements.get('#previewLayer').innerHTML.includes('invalid-x'));
touch.elements.get('#remove').onclick();assert.equal(touch.run('Object.keys(placements()).length'),0);
// Drag straight from the tray with either input; release alone commits.
for(const type of ['touch','mouse']){
 const a=boot(),tray=a.elements.get('#tray');const target={closest:()=>({dataset:{piece:'redI'}})};
 tray.onpointerdown(ev(100,900,type,target));tray.onpointermove(ev(150,550,type,target));tray.onpointerup(ev(150,550,type,target));
 assert.equal(a.run('placements().redI.x'),1);assert.equal(a.run('placements().redI.y'),5);assert.equal(a.run('selected'),null);
 const saved=a.run('JSON.stringify(placements())');
 tray.onpointerdown(ev(100,900,type,target));tray.onpointermove(ev(900,900,type,target));tray.onpointerup(ev(900,900,type,target));
 assert.equal(a.run('JSON.stringify(placements())'),saved);assert.equal(a.run('hover'),null);
 a.run("selected=null;shape=null;hover=null;draw()");
 tray.onpointerdown(ev(100,900,type,target));tray.onpointerup(ev(100,900,type,target));assert.equal(a.run('selected'),'redI');
 tray.onpointerdown(ev(100,900,type,target));tray.onpointerup(ev(100,900,type,target));assert.equal(a.run('selected'),null);
}
console.log('PASS: mouse/touch release commits, tray drag and click toggle, grip offset, invalid X preview, outside drop, touch scrolling.');

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
ghosts.run("choose('redI')");assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="false"'));
assert(!ghosts.elements.get('#ghostLayer').innerHTML.includes('filter="url(#ghostGray)"'));
assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('ghost-sprite awake'));
// Cancelling a pickup brings back the tile and its original ghost coverage.
ghosts.run("choose('redI')");assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
ghosts.run("choose('redI')");assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="false"'));
ghosts.elements.get('#remove').onclick();assert(!ghosts.elements.get('#ghostLayer').innerHTML.includes('data-caught="true"'));
ghosts.elements.get('#undo').onclick();assert(ghosts.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
ghosts.elements.get('#clear').onclick();assert(!ghosts.elements.get('#ghostLayer').innerHTML.includes('data-caught="true"'));
console.log('PASS: captured ghost gray, picking piece up restores color, cancelling returns gray, remove/undo/clear all refresh ghosts.');

// Regression: moving the tile must not leave behind a gray ghost or a stale fruit/lever.
const moveGhost=boot();
moveGhost.run("choose('redI');place(1,3);choose('redI')");
assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="false"'));
moveGhost.run('place(1,4)');
assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="false"'));
moveGhost.elements.get('#undo').onclick();
assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
moveGhost.run("choose('redI');choose('yellowI')");
assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
moveGhost.run("choose('redI')");
assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="false"'));
moveGhost.run("choose('redI')");
assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
// Multiple cycles reproduce the intermittent problem (including changes of selected piece).
for(let i=0;i<25;i++){
 moveGhost.run("choose('redI')");
 assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="false"'));
 moveGhost.run("choose('redI')");
 assert(moveGhost.elements.get('#ghostLayer').innerHTML.includes('data-ghost="1,3" data-caught="true"'));
}
// Direct placement fixtures cover all board variants and ghost colors.
const ghostMaps=boot();
for(let stage=0;stage<3;stage++){
 ghostMaps.run(`state.index=${stage};render()`);
 const ghostList=ghostMaps.run('level().ghosts.map(g=>({at:g.at,color:g.color}))');
 for(const g of ghostList){
  const id=ghostMaps.run(`level().pieces.find(id=>defs[id].color==='${g.color}')`);
  const placement={id,color:g.color,cells:[[0,0]],x:g.at[0],y:g.at[1]};
  ghostMaps.run(`state.boards[level().id]={${JSON.stringify(id)}:${JSON.stringify(placement)}};draw()`);
  const which=`data-ghost="${g.at.join(',')}" data-caught="`;
  assert(ghostMaps.elements.get('#ghostLayer').innerHTML.includes(which+'true"'),`${stage}: ${g.at} was not caught`);
  ghostMaps.run(`choose(${JSON.stringify(id)})`);
  assert(ghostMaps.elements.get('#ghostLayer').innerHTML.includes(which+'false"'),`${stage}: ${g.at} stayed gray after pickup`);
  ghostMaps.run(`choose(${JSON.stringify(id)})`);
  assert(ghostMaps.elements.get('#ghostLayer').innerHTML.includes(which+'true"'),`${stage}: ${g.at} not gray after cancelled pickup`);
  ghostMaps.run(`choose(${JSON.stringify(id)})`);
  ghostMaps.elements.get('#remove').onclick();
  assert(ghostMaps.elements.get('#ghostLayer').innerHTML.includes(which+'false"'),`${stage}: ${g.at} stayed gray after removal`);
 }
}
console.log('PASS: 25 repeated ghost pickups and return; moving, undo, switching selection; each ghost on all 3 boards uncovers and recolors.');

const fruitMotion=boot();assert(fruitMotion.elements.get('#fruitLayer').innerHTML.includes('fruit-sprite bouncing'));
fruitMotion.run("choose('redI');place(1,4)");assert(fruitMotion.elements.get('#fruitLayer').innerHTML.includes('data-fruit="1,6" data-collected="true"'));
assert(fruitMotion.elements.get('#placedLayer').innerHTML.includes('fill-opacity="0.6384"'));
fruitMotion.elements.get('#undo').onclick();assert(!fruitMotion.elements.get('#fruitLayer').innerHTML.includes('data-collected="true"'));
fruitMotion.run("choose('redI');place(0,3)");assert(fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active="0,4"'));assert(fruitMotion.elements.get('#featureLayer').innerHTML.includes('assets/lever-left.png'));
fruitMotion.run("choose('redI')");fruitMotion.elements.get('#remove').onclick();assert(!fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active'));
fruitMotion.elements.get('#undo').onclick();assert(fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active'));
fruitMotion.elements.get('#clear').onclick();assert(!fruitMotion.elements.get('#featureLayer').innerHTML.includes('data-lever-active'));
console.log('PASS: fruit motion stops on collection and resumes after undo; active lever artwork follows placement/remove/undo/clear; placed tile fill opacity increased by 33%.');

// Visual coverage always follows only pieces physically displayed on the board.
const pickupFeatures=boot();
pickupFeatures.run("choose('redI');place(1,4)");
assert(pickupFeatures.elements.get('#fruitLayer').innerHTML.includes('data-fruit="1,6" data-collected="true"'));
pickupFeatures.run("choose('redI')");
assert(pickupFeatures.elements.get('#fruitLayer').innerHTML.includes('data-fruit="1,6" data-collected="false"'));
assert(pickupFeatures.elements.get('#fruitLayer').innerHTML.includes('fruit-sprite bouncing'));
assert(pickupFeatures.elements.get('#fruitCount').textContent.includes('0'));
pickupFeatures.run("choose('redI')");
assert(pickupFeatures.elements.get('#fruitLayer').innerHTML.includes('data-fruit="1,6" data-collected="true"'));
pickupFeatures.run("state.boards[level().id]={};choose('redI');place(0,3)");
assert(pickupFeatures.elements.get('#featureLayer').innerHTML.includes('data-lever-active="0,4"'));
pickupFeatures.run("choose('redI')");
assert(!pickupFeatures.elements.get('#featureLayer').innerHTML.includes('data-lever-active'));
assert(!pickupFeatures.elements.get('#featureLayer').innerHTML.includes('data-retracted'));
pickupFeatures.run("choose('redI')");
assert(pickupFeatures.elements.get('#featureLayer').innerHTML.includes('data-lever-active="0,4"'));
pickupFeatures.run("state.index=1;render();state.boards[level().id]={blueL:{id:'blueL',color:'blue',cells:[[0,0]],x:6,y:2}};draw()");
assert(pickupFeatures.elements.get('#diamondLayer').innerHTML.includes('data-diamond="6,2" data-collected="true"'));
pickupFeatures.run("choose('blueL')");
assert(pickupFeatures.elements.get('#diamondLayer').innerHTML.includes('data-diamond="6,2" data-collected="false"'));
assert(!pickupFeatures.elements.get('#diamondLayer').innerHTML.includes('filter="url(#ghostGray)"'));
console.log('PASS: lifting a piece immediately restores fruit, diamond, lever, spikes and count; cancelling pickup restores them.');

const intro=boot(false);assert(intro.elements.get('#languageStart').open);assert(!intro.elements.get('#rules').open);assert.equal(intro.elements.get('#startLanguages').children.length,6);intro.elements.get('#startLanguages').children[1].onclick();assert.equal(intro.run('lang'),'en');assert(!intro.elements.get('#languageStart').open);assert(intro.elements.get('#rules').open);intro.run('state.index=1;render()');assert(!intro.elements.get('#languageStart').open);
const scrolling=boot();scrolling.run('touchMode=true');scrolling.elements.get('#board').onpointerdown({pointerType:'touch',isPrimary:true,preventDefault(){throw Error('Scroll blocked')}});assert.equal(scrolling.run('touchGesture'),null);
scrolling.run('state.index=1;render()');assert(scrolling.elements.get('#diamondLayer').innerHTML.includes('sparkling'));scrolling.run("state.boards[level().id]={redI:{id:'redI',color:'red',x:6,y:2,cells:[[0,0]]}};draw()");assert(scrolling.elements.get('#diamondLayer').innerHTML.includes('data-diamond="6,2" data-collected="true"'));assert(scrolling.elements.get('#diamondLayer').innerHTML.includes('filter="url(#ghostGray)"'));
console.log('PASS: language picker precedes tutorial, does not reopen on next map; unselected map permits scrolling; collected diamond becomes gray.');

const centering=boot();centering.run('touchMode=true;window.innerHeight=800;window.scrollY=0;window.scrollTo=o=>window.lastScroll=o');centering.elements.get('#board').getBoundingClientRect=()=>({top:200,height:320});centering.elements.set('.tool-panel',{getBoundingClientRect:()=>({top:560})});centering.elements.get('#guideExit').onclick();assert.equal(centering.run('window.lastScroll.top'),80);console.log('PASS: mobile map centers above fixed controls after tutorial.');

const discard=boot();discard.run("choose('redI');place(1,5)");const saved=discard.run('JSON.stringify(placements())'),undoCount=discard.run('history.length');discard.run("touchMode=true;choose('yellowI');hover=[3,3];floating=[3.2,3];draw()");assert.equal(discard.elements.get('#remove').disabled,false);discard.elements.get('#remove').onclick();assert.equal(discard.run('JSON.stringify(placements())'),saved);assert.equal(discard.run('history.length'),undoCount);for(const name of ['selected','shape','hover','floating','touchGesture'])assert.equal(discard.run(name),null);assert.equal(discard.elements.get('#previewLayer').innerHTML,'');assert(discard.elements.get('#remove').disabled);discard.elements.get('#undo').onclick();assert.equal(discard.run('Object.keys(placements()).length'),0);
console.log('PASS: discard unplaced tile preserves board and undo history.');

// Wrong ghost colour, partial diamonds and inactive spikes cannot complete a lesson.
const badLessons=boot();
badLessons.run("guideIndex=3;resetLesson();lessonChoose('blueL');lessonHover=[1,0];lessonPlace()");
assert.equal(badLessons.run('Object.keys(lessonState.ps).length'),0);assert(!badLessons.run('lessonSolved()'));
badLessons.run("guideIndex=5;resetLesson();lessonChoose('redI');lessonHover=[0,0];lessonPlace()");assert(!badLessons.run('lessonSolved()'));assert(badLessons.elements.get('#guideNext').disabled);
badLessons.elements.get('#lessonReset').onclick();assert.equal(badLessons.run('Object.keys(lessonState.ps).length'),0);
// Cancelled drag never commits; a second pointer does not steal the active gesture.
const cancelDrag=boot(),ct=cancelDrag.elements.get('#tray');const rt={closest:()=>({dataset:{piece:'redI'}})};
ct.onpointerdown(ev(10,900,'touch',rt));ct.onpointermove(ev(150,550,'touch',rt));
ct.onpointerup({...ev(150,550,'touch',rt),pointerId:2});assert(cancelDrag.run('gameDrag.active()'));
ct.onpointercancel(ev(150,550,'touch',rt));assert(!cancelDrag.run('gameDrag.active()'));assert.equal(cancelDrag.run('Object.keys(placements()).length'),0);
// Small mobile board: preserve the grabbed square and snap at release.
const small=boot(),sb=small.elements.get('#board');small.elements.get('#grid').getBoundingClientRect=()=>({left:10,top:20,width:320,height:320});
small.run("touchMode=true;choose('redI');hover=[1,5]");sb.onpointerdown(ev(70,280));sb.onpointermove(ev(91,280));assert(Math.abs(small.run('floating[0]')-1.525)<.001);sb.onpointerup(ev(91,280));assert.equal(small.run('placements().redI.x'),2);assert.equal(small.run('placements().redI.y'),5);
console.log('PASS: negative tutorial cases, retry, pointer cancellation, second-pointer isolation, 320px board grip and release.');
