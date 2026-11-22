const fs=require('fs'),vm=require('vm'),assert=require('assert');const harness=fs.readFileSync('test-ui.cjs','utf8').split('const app=boot();')[0]+'\nglobalThis.a=boot();';const ctx={require,console};vm.createContext(ctx);vm.runInContext(harness,ctx);const a=ctx.a;
a.run('guideWelcome=false');
for(let i=0;i<9;i++){
 const result=a.run(`(()=>{guideIndex=${i};resetLesson();const l=lesson(),options=l.pieces.map(id=>{let shapes=[],seen=new Set();for(let flip=0;flip<2;flip++){let c=flip?E.flip(defs[id].cells):E.normalize(defs[id].cells);for(let r=0;r<4;r++){const k=JSON.stringify(c);if(!seen.has(k)){seen.add(k);shapes.push(c)}c=E.rotate(c)}}return shapes.flatMap(cells=>Array.from({length:25},(_,j)=>({id,color:defs[id].color,cells,x:j%5,y:Math.floor(j/5)}))).filter(p=>!E.validPlacement(l,p,[]))});let solutions=[],noLever=0,fruitWithoutSpikes=0;function walk(ps,n){if(n===options.length){lessonState.ps=Object.fromEntries(ps.map(p=>[p.id,p]));if(lessonSolved())solutions.push(ps);if(l.key==='spikes'){const cov=new Set(ps.flatMap(E.cells).map(E.key));if(l.fruits.every(c=>cov.has(E.key(c)))&&!cov.has(E.key(l.spikes[0].at)))fruitWithoutSpikes++;if(E.check(l,lessonState.ps).ok&&!cov.has(E.key(l.spikes[0].lever)))noLever++;}return;}for(const p of options[n])if(!E.validPlacement(l,p,ps))walk([...ps,p],n+1);}walk([],0);return {key:l.key,count:solutions.length,noLever,fruitWithoutSpikes,first:solutions[0]}})()`);
 assert(result.count>0,result.key+' unsolvable');assert(a.run('lesson().walls.length>0'));if(result.key==='spikes'){assert.equal(result.count,1);assert.equal(result.noLever,0);assert.equal(result.fruitWithoutSpikes,0);assert.equal(a.run('lesson().fruits.length'),2);}console.log('PASS: '+result.key+' - '+result.count+' solutions');
}

// Welcome is a valid solved example, separate from the nine playable exercises.
a.run('openGuide(true)');assert(a.run('guideWelcome'));assert(a.elements.get('#lessonGrid').hidden);assert(!a.elements.get('#guideNext').disabled);
assert(a.run('E.check(lesson(),Object.fromEntries(welcomePieces.map(p=>[p.id,p]))).ok'));
assert.equal(a.run('Object.keys(placements()).length'),0);
a.elements.get('#guideNext').onclick();assert(!a.run('guideWelcome'));assert.equal(a.run('guideIndex'),0);assert(!a.elements.get('#lessonGrid').hidden);
a.elements.get('#guidePrev').onclick();assert(a.run('guideWelcome'));
// A valid mission with an uncovered ghost must pass the exercise as well.
const ghostSolution=JSON.parse(fs.readFileSync('tutorial-solutions.json','utf8'))[5];
a.run(`guideWelcome=false;guideIndex=5;resetLesson();lessonState.ps=${JSON.stringify({})}`);
for(const p of ghostSolution)a.run(`lessonState.ps['${p.id}']=${JSON.stringify(p)}`);
assert(a.run('lessonSolved()'));assert(a.run("!new Set(Object.values(lessonState.ps).flatMap(E.cells).map(E.key)).has('4,0')"));
console.log('PASS: welcome example, back/next, optional uncovered ghost.');
