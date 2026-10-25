const fs=require('fs'),assert=require('assert');global.window=global;require('./levels.js');require('./engine.js');const E=Pantori;
function solve(l){
 let candidates={};for(const id of l.pieces){let def=PANTORI_PIECES[id],orients=[],seen=new Set();for(let f=0;f<2;f++){let c=f?E.flip(def.cells):def.cells;for(let r=0;r<4;r++){c=E.rotate(c);let k=JSON.stringify(c);if(!seen.has(k)){seen.add(k);orients.push(c);}}}candidates[id]=[];for(const c of orients)for(let y=0;y<8;y++)for(let x=0;x<8;x++){let p={id,color:def.color,cells:c,x,y};if(!E.validPlacement(l,p,[]))candidates[id].push(p);}}
 function rec(ps,remaining){if(!remaining.length)return E.check(l,ps).ok?ps:null;let used=new Set(Object.values(ps).flatMap(E.cells).map(E.key));let uncovered=l.fruits.filter(c=>!used.has(E.key(c)));let available={};for(const id of remaining){available[id]=candidates[id].filter(p=>!E.validPlacement(l,p,Object.values(ps))&&Object.values(ps).every(q=>E.contacts(p,q)<=1));if(!available[id].length)return null;}
 let choices;if(uncovered.length){let best=null;for(const fruit of uncovered){let opts=remaining.flatMap(id=>available[id].filter(p=>E.cells(p).some(c=>E.key(c)===E.key(fruit))));if(!opts.length)return null;if(!best||opts.length<best.length)best=opts;}choices=best;}else{let id=remaining.reduce((a,b)=>available[a].length<available[b].length?a:b);choices=available[id];}
 for(const p of choices){let result=rec({...ps,[p.id]:p},remaining.filter(id=>id!==p.id));if(result)return result;}return null;}
 return rec({},l.pieces);
}
let solutions={};for(const l of PANTORI_LEVELS){let s=solve(l);assert(s,`No solution ${l.id}`);assert(E.check(l,s).ok);solutions[l.id]=s;console.log('Verified solution',l.id);let p=structuredClone(s);delete p[l.pieces[0]];assert(!E.check(l,p).ok);let bad=structuredClone(s);bad[l.pieces[0]].x=-9;assert(!E.check(l,bad).ok);}
fs.writeFileSync('solutions.js','window.PANTORI_SOLUTIONS='+JSON.stringify(solutions)+';\n');console.log('All level solvability and negative checks passed.');
const empty={size:8,pieces:['a','b'],walls:[],fruits:[],diamonds:[],spikes:[],ghosts:[]};
const unit=(id,x,y,color='red')=>({id,x,y,color,cells:[[0,0]]});
assert(E.check(empty,{a:unit('a',0,0),b:unit('b',1,0)}).ok);
assert(E.check(empty,{a:unit('a',0,0),b:unit('b',2,0)}).errors.some(e=>e.includes('Połącz')));
assert(E.check(empty,{a:unit('a',0,0),b:unit('b',1,1)}).errors.some(e=>e.includes('Połącz')));
assert(E.check(empty,{a:unit('a',2,2),b:unit('b',3,2)}).errors.some(e=>e.includes('krawędzi')));
const domino=(id,x,y)=>({...unit(id,x,y),cells:[[0,0],[1,0]]});
assert(E.check(empty,{a:domino('a',0,0),b:domino('b',0,1)}).errors.some(e=>e.includes('jednym wspólnym')));
assert(E.validPlacement({...empty,walls:[[0,0]]},unit('a',0,0),[]));
assert(E.validPlacement({...empty,ghosts:[{at:[0,0],color:'blue'}]},unit('a',0,0),[]));
assert(!E.validPlacement({...empty,ghosts:[{at:[0,0],color:'red'}]},unit('a',0,0),[]));
assert(E.validPlacement(empty,unit('a',0,0),[unit('b',0,0)]));
const pair={a:unit('a',0,0),b:unit('b',1,0)};
assert(E.check({...empty,diamonds:[[0,0],[5,5]]},pair).errors.some(e=>e.includes('diamenty')));
assert(E.check({...empty,diamonds:[[0,0],[1,0]]},pair).ok);
assert(E.check({...empty,diamonds:[[4,4],[5,5]]},pair).ok);
assert(E.check({...empty,spikes:[{at:[0,0],lever:[5,5]}]},pair).errors.some(e=>e.includes('dźwigni')));
assert(E.check({...empty,spikes:[{at:[0,0],lever:[1,0]}]},pair).ok);
assert(E.check({...empty,spikes:[{at:[5,5],lever:[0,0]}]},pair).ok);
assert(E.check({...empty,fruits:[[7,7]]},pair).errors.some(e=>e.includes('owoce')));
for(const p of Object.values(PANTORI_PIECES)){let c=p.cells;for(let i=0;i<4;i++)c=E.rotate(c);assert.deepEqual(c,E.normalize(p.cells));assert.deepEqual(E.flip(E.flip(p.cells)),E.normalize(p.cells));}
console.log('Rules verified: connectivity, corner contact, double contact, edge, walls, ghosts, overlap, fruit, diamonds, lever, transforms.');
