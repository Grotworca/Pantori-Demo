(function(root){
const key=([x,y])=>`${x},${y}`;
const normalize=c=>{let x=Math.min(...c.map(p=>p[0])),y=Math.min(...c.map(p=>p[1]));return c.map(p=>[p[0]-x,p[1]-y]).sort((a,b)=>a[1]-b[1]||a[0]-b[0]);};
const rotate=c=>normalize(c.map(([x,y])=>[-y,x]));
const flip=c=>normalize(c.map(([x,y])=>[-x,y]));
const cells=p=>p.cells.map(([x,y])=>[x+p.x,y+p.y]);
const contacts=(a,b)=>cells(a).reduce((n,[x,y])=>n+cells(b).filter(([u,v])=>Math.abs(x-u)+Math.abs(y-v)===1).length,0);
function validPlacement(level,p,others){
 const wall=new Set(level.walls.map(key)),used=new Set(others.flatMap(cells).map(key));
 for(const c of cells(p)){
 if(c.some(v=>v<0||v>=level.size))return 'Klocek wystaje poza planszę.';
 if(wall.has(key(c)))return 'Mur musi pozostać odkryty.';
 if(used.has(key(c)))return 'Klocki nie mogą na siebie nachodzić.';
 const g=level.ghosts.find(g=>key(g.at)===key(c));
 if(g&&g.color!==p.color)return 'Ducha może zakryć tylko klocek w jego kolorze.';
 }
 return null;
}
function check(level,placements){
 const ps=Object.values(placements),covered=new Set(ps.flatMap(cells).map(key)),errors=[];
 if(ps.length!==level.pieces.length||level.pieces.some(id=>!placements[id]))errors.push('Użyj wszystkich wskazanych klocków.');
 for(const p of ps){let e=validPlacement(level,p,ps.filter(q=>q!==p));if(e&&!errors.includes(e))errors.push(e);}
 const fruit=level.fruits.filter(c=>covered.has(key(c))).length;
 if(fruit<level.fruits.length)errors.push('Zakryj wszystkie owoce.');
 const d=level.diamonds.filter(c=>covered.has(key(c))).length;
 if(d&&d!==level.diamonds.length)errors.push('Zakryj wszystkie diamenty albo pozostaw wszystkie odkryte.');
 if(level.spikes.some(s=>covered.has(key(s.at))&&!covered.has(key(s.lever))))errors.push('Zakryte kolce wymagają zakrycia połączonej dźwigni.');
 let multiple=false;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++)if(contacts(ps[i],ps[j])>1)multiple=true;
 if(multiple)errors.push('Dwa klocki mogą stykać się tylko jednym wspólnym bokiem.');
 if(ps.length){let seen=new Set([0]),todo=[0];while(todo.length){let i=todo.pop();ps.forEach((p,j)=>{if(!seen.has(j)&&contacts(ps[i],p)>0){seen.add(j);todo.push(j);}});}if(seen.size!==ps.length)errors.push('Połącz wszystkie klocki bokami w jedną drogę.');}
 if(!ps.some(p=>cells(p).some(([x,y])=>x===0||y===0||x===level.size-1||y===level.size-1)))errors.push('Droga musi dochodzić do krawędzi planszy.');
 return {ok:errors.length===0,errors,fruit};
}
root.Pantori={normalize,rotate,flip,cells,contacts,validPlacement,check,key};
})(typeof window==='undefined'?globalThis:window);
