const fs=require('fs'),vm=require('vm'),assert=require('assert');
function boot(){const elements=new Map(),storageCalls=[];
 const element=()=>({innerHTML:'',textContent:'',disabled:false,open:false,classList:{toggle(){}},setAttribute(){},append(){},scrollIntoView(){},showModal(){this.open=true},close(){this.open=false},addEventListener(){},focus(){}});
 const document={documentElement:{},querySelectorAll(){return []},querySelector(s){if(s==='dialog[open]')return null;if(!elements.has(s))elements.set(s,element());return elements.get(s)},createElement:element,addEventListener(){}};
 const context={document,matchMedia:()=>({matches:false}),localStorage:{getItem(){throw Error('Old progress must not be read')},setItem(){throw Error('Progress must not be persisted')},removeItem(k){storageCalls.push(k)}},console};context.window=context;vm.createContext(context);
 for(const f of ['levels.js','engine.js','i18n.js','app.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
 return {run:s=>vm.runInContext(s,context),elements,storageCalls};}
const app=boot();assert.deepEqual(app.storageCalls,['pantori-demo-v1']);
app.run("choose('redI');place(1,5)");assert.equal(app.run('Object.keys(placements()).length'),1);
app.elements.get('#clear').onclick();assert.equal(app.run('Object.keys(placements()).length'),0);assert.equal(app.run('selected'),null);assert.equal(app.run('hover'),null);
app.elements.get('#undo').onclick();assert.equal(app.run('Object.keys(placements()).length'),1);
const reopened=boot();assert.equal(reopened.run('Object.keys(placements()).length'),0);assert.equal(reopened.run('state.index'),0);
assert(app.run("levels.every(l=>l.image.endsWith('.png'))"));
const html=fs.readFileSync('index.html','utf8');assert(html.includes('id="clear"'));for(const id of ['check','hint','reset'])assert(!html.includes(`id="${id}"`));
console.log('PASS: clear all, undo clear, fresh reopen, legacy save removed, original PNG maps, removed options stay removed.');

app.run("choose('redI');draw()");assert(app.elements.get('#overlay').innerHTML.includes('opacity="0.5"'));
for(const lang of ['pl','en','de','fr','es','it']){app.run(`lang='${lang}';languageUI();renderBoardLabels();renderTools();draw()`);assert.equal(app.run('selected'),'redI');assert.equal(app.run('Object.keys(placements()).length'),1);}
app.run("choose('redI');draw()");assert(!app.elements.get('#overlay').innerHTML.includes('opacity="0.5"'));
console.log('PASS: moving piece opacity, six languages, switching language preserves board and selection.');
const translated=boot();const dict=translated.run('dictionaries');const expected=Object.keys(dict.pl).sort();for(const [code,d]of Object.entries(dict)){assert.deepEqual(Object.keys(d).sort(),expected);for(const [k,v]of Object.entries(d))assert(v.length>0,code+':'+k);}
const page=fs.readFileSync('index.html','utf8');for(const match of page.matchAll(/data-i18n="([^"]+)"/g))assert(dict.pl[match[1]],match[1]);
translated.run(fs.readFileSync('solutions.js','utf8'));
for(let i=0;i<3;i++){translated.run(`state.index=${i};render();lang='fr';for(const p of Object.values(PANTORI_SOLUTIONS[level().id])){choose(p.id);shape=p.cells;place(p.x+shape[0][0],p.y+shape[0][1]);}`);assert.equal(translated.elements.get('#win').open,true);assert(translated.run('state.complete.includes(level().id)'));translated.elements.get('#win').close();}
console.log('PASS: every translation key complete; all three levels auto-complete with translated victory messages.');

const guide=boot();assert(guide.elements.get('#rules').open);assert.equal(guide.elements.get('#guideExit').textContent,'Rozpocznij grę');
for(let i=1;i<6;i++){guide.elements.get('#guideNext').onclick();assert.equal(guide.run('guideIndex'),i);}
assert(guide.elements.get('#guideNext').disabled);guide.elements.get('#guideExit').onclick();assert(!guide.elements.get('#rules').open);guide.run("choose('redI');place(1,5)");guide.elements.get('#rulesBtn').onclick();assert.equal(guide.run('guideIndex'),0);assert.equal(guide.elements.get('#guideExit').textContent,'Wróć do gry');guide.elements.get('#guideExit').onclick();assert.equal(guide.run('Object.keys(placements()).length'),1);
console.log('PASS: startup guide, sequential slides, last-step boundary, start/back labels, board preserved.');
