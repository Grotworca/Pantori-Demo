'use strict';
let guideIndex=0,guideStartup=true,lessonState=null,lessonSelected=null,lessonShape=null,lessonHover=null,lessonSuppress=0;
const lessonBase={size:5,walls:[],ghosts:[],fruits:[],diamonds:[],spikes:[],pieces:['redI']};
const lessons=[
 {key:'fruit',fruits:[[0,1],[0,3]]},
 {key:'edge',fruits:[[2,2]]},
 {key:'contact',pieces:['redI','blueL'],fruits:[[0,0],[2,1]]},
 {key:'ghost',pieces:['redI','blueL'],fruits:[[0,0],[2,2]],ghosts:[{at:[0,1],color:'red'},{at:[2,1],color:'blue'}]},
 {key:'spikes',pieces:['redI','blueL'],fruits:[[0,0],[2,1]],spikes:[{at:[2,1],lever:[0,1]}]},
 {key:'diamonds',pieces:['redI','blueL'],fruits:[[0,0],[2,2]],diamonds:[[0,1],[2,1]],diamondGoal:'all'},
 {key:'diamondsNone',fruits:[[0,1],[0,3]],diamonds:[[2,1],[3,3]],diamondGoal:'none'},
 {key:'rotate',fruits:[[0,2],[2,2]]},
 {key:'flip',pieces:['blueS'],target:[[0,0],[1,0],[1,1],[1,2],[2,2]],fruits:[[0,0],[2,2]]}
];
function lesson(){return {...lessonBase,...lessons[guideIndex]};}
function lessonVisible(){return Object.values(lessonState.ps).filter(p=>p.id!==lessonSelected);}
function lessonProposal(){const a=lessonShape[0];return {id:lessonSelected,color:PANTORI_PIECES[lessonSelected].color,cells:lessonShape,x:lessonHover[0]-a[0],y:lessonHover[1]-a[1]};}
function lessonSolved(){
 const l=lesson(),ps=lessonState.ps;
 if(lessonSelected||!Pantori.check(l,ps).ok)return false;
 const covered=new Set(Object.values(ps).flatMap(Pantori.cells).map(Pantori.key));
 if(l.ghosts.some(g=>!covered.has(Pantori.key(g.at))))return false;
 if(l.diamondGoal==='all'&&!l.diamonds.every(c=>covered.has(Pantori.key(c))))return false;
 if(l.diamondGoal==='none'&&l.diamonds.some(c=>covered.has(Pantori.key(c))))return false;
 if(l.target&&(covered.size!==l.target.length||!l.target.every(c=>covered.has(Pantori.key(c)))))return false;
 return true;
}
function lessonChoose(id){if(lessonSelected===id){lessonSelected=null;lessonShape=null;lessonHover=null;}else{lessonSelected=id;lessonShape=Pantori.normalize(lessonState.ps[id]?.cells||PANTORI_PIECES[id].cells);lessonHover=null;}renderGuide();}
function lessonPlace(){
 if(!lessonSelected||!lessonHover)return;
 const p=lessonProposal(),error=Pantori.validPlacement(lesson(),p,lessonVisible());
 if(error){renderLesson();document.querySelector('#lessonFeedback').textContent=translateError(error);return;}
 lessonState.ps[lessonSelected]=p;lessonSelected=null;lessonShape=null;lessonHover=null;renderGuide();
}
function resetLesson(){lessonSelected=null;lessonShape=null;lessonHover=null;lessonState={ps:{}};renderGuide();}
function lessonIcon(at,src,gray=false){if(src==='assets/tutorial-spikes.png'||src==='assets/tutorial-lever.png'){const crop=src.includes('spikes')?'205 105 90 90':'5 405 90 90';return `<svg x="${at[0]*100+10}" y="${at[1]*100+10}" width="80" height="80" viewBox="${crop}"><image href="assets/map-16.png" width="800" height="800"/></svg>`;}return `<image href="${src}" x="${at[0]*100+16}" y="${at[1]*100+16}" width="68" height="68" ${gray?'style="filter:grayscale(1)"':''}/>`;}
function lessonTiles(p,preview=false,bad=false){return `<g class="${bad?'invalid-preview':''}">${Pantori.cells(p).map(([x,y])=>`<rect x="${x*100+5}" y="${y*100+5}" width="90" height="90" rx="8" fill="${bad?'#888':palette[p.color]}" fill-opacity="${preview?.45:.64}" stroke="${bad?'#555':palette[p.color]}" stroke-width="6" ${preview?'stroke-dasharray="9 5"':''}/>${bad?`<path d="M${x*100+35} ${y*100+35}l30 30m0 -30l-30 30" stroke="white" stroke-width="8"/>`:''}`).join('')}</g>`;}
function renderLesson(){
 if(!lessonState)return;
 const l=lesson(),ps=lessonVisible(),covered=new Set(ps.flatMap(Pantori.cells).map(Pantori.key));
 let svg='';for(let y=0;y<5;y++)for(let x=0;x<5;x++)svg+=`<rect x="${x*100+2}" y="${y*100+2}" width="96" height="96" rx="7" fill="#fffdf4" stroke="#272331" stroke-width="4"/>`;
 if(l.target)svg+=l.target.map(([x,y])=>`<rect x="${x*100+10}" y="${y*100+10}" width="80" height="80" rx="6" fill="#dce4ff" stroke="#516fc7" stroke-dasharray="7 6" stroke-width="3"/>`).join('');
 l.fruits.forEach(at=>svg+=lessonIcon(at,'assets/sprites/icon-16-3-2.png'));
 l.spikes.forEach(s=>{const active=covered.has(Pantori.key(s.lever));svg+=lessonIcon(s.at,active?'assets/spikes-retracted.png':'assets/tutorial-spikes.png');svg+=lessonIcon(s.lever,active?'assets/lever-left.png':'assets/tutorial-lever.png');});
 svg+=ps.map(p=>lessonTiles(p)).join('');
 l.ghosts.forEach(g=>svg+=lessonIcon(g.at,g.color==='red'?'assets/sprites/icon-16-1-3.png':'assets/sprites/icon-16-7-2.png',covered.has(Pantori.key(g.at))));
 l.diamonds.forEach(at=>svg+=lessonIcon(at,'assets/sprites/icon-17-6-2.png',covered.has(Pantori.key(at))));
 let error=null;
 if(lessonSelected&&lessonHover){const p=lessonProposal();error=Pantori.validPlacement(l,p,ps);svg+=lessonTiles(p,true,!!error);}
 document.querySelector('#lessonArt').innerHTML=svg;
 document.querySelector('#lessonBoard').classList.toggle('piece-selected',!!lessonSelected);
 const solved=lessonSolved();
 if(!error&&!lessonSelected&&!solved&&ps.length===l.pieces.length)error=Pantori.check(l,lessonState.ps).errors[0]||null;
 document.querySelector('#lessonFeedback').textContent=error?translateError(error):t(solved?'lessonSuccess':'lessonTry');
 document.querySelector('#lessonFeedback').classList.toggle('solved',solved);
 document.querySelector('#guideNext').disabled=!solved||guideIndex===lessons.length-1;
 document.querySelector('#lessonRotate').disabled=document.querySelector('#lessonFlip').disabled=!lessonSelected;
}
function renderGuide(){
 const $=s=>document.querySelector(s),l=lesson();
 $('#guideCount').textContent=t('guideCount',{n:guideIndex+1,total:lessons.length});
 $('#guideTitle').textContent=t('lessonTitle_'+l.key);$('#guideDescription').textContent=t('lesson_'+l.key);
 $('#guidePrev').textContent='← '+t('guidePrev');$('#guidePrev').disabled=guideIndex===0;
 $('#guideNext').textContent=t('guideNext')+' →';$('#guideExit').textContent=t(guideStartup?'startGame':'backGame');
 if(!lessonState){$('#guideNext').disabled=true;return;}
 $('#lessonTray').innerHTML='';for(const id of l.pieces){const b=document.createElement('button');b.dataset.piece=id;b.className='piece-button'+(id===lessonSelected?' active':'');b.setAttribute('aria-label',t(id));b.setAttribute('aria-pressed',String(id===lessonSelected));b.innerHTML=tileSvg(id===lessonSelected?lessonShape:lessonState.ps[id]?.cells||PANTORI_PIECES[id].cells,PANTORI_PIECES[id].color);b.onclick=e=>{if(e.detail!==0&&Date.now()<lessonSuppress)return;lessonChoose(id)};$('#lessonTray').append(b);}
 renderLesson();
}
function openGuide(startup=false){guideStartup=startup;guideIndex=0;resetLesson();if(!document.querySelector('#rules').open)document.querySelector('#rules').showModal();}
// The exercise owns its own placements; playing it never mutates the expedition.
const lessonDrag=installPieceDrag({board:document.querySelector('#lessonBoard'),tray:document.querySelector('#lessonTray'),surface:document.querySelector('#lessonBoard'),size:()=>5,
 selected:()=>lessonSelected,shape:()=>lessonShape,hover:()=>lessonHover,click:lessonChoose,
 select:id=>{if(lessonSelected!==id)lessonChoose(id)},
 hit:(x,y)=>Object.values(lessonState.ps).find(p=>Pantori.cells(p).some(c=>c[0]===x&&c[1]===y)),
 update:p=>{lessonHover=p;renderLesson()},drop:lessonPlace,suppress:()=>lessonSuppress=Date.now()+650,mode:touch=>setInputMode(touch)});
const lessonGrid=document.querySelector('#lessonGrid');
for(let y=0;y<5;y++)for(let x=0;x<5;x++){const b=document.createElement('button');b.className='cell';b.setAttribute('aria-label',`${x+1}, ${y+1}`);b.onclick=e=>{if(e.detail!==0&&Date.now()<lessonSuppress)return;if(lessonSelected){lessonHover=[x,y];lessonPlace();}else{const hit=Object.values(lessonState.ps).find(p=>Pantori.cells(p).some(c=>c[0]===x&&c[1]===y));if(hit)lessonChoose(hit.id);}};b.onpointerenter=e=>{if(e.pointerType==='mouse'&&!lessonDrag.active()&&lessonSelected){lessonHover=[x,y];renderLesson();}};lessonGrid.append(b);}
document.querySelector('#lessonRotate').onclick=()=>{if(lessonSelected){lessonShape=Pantori.rotate(lessonShape);renderGuide();}};
document.querySelector('#lessonFlip').onclick=()=>{if(lessonSelected){lessonShape=Pantori.flip(lessonShape);renderGuide();}};
document.querySelector('#lessonReset').onclick=()=>{lessonDrag.cancel();resetLesson();};
document.querySelector('#guideNext').onclick=()=>{if(lessonSolved()&&guideIndex<lessons.length-1){lessonDrag.cancel();guideIndex++;resetLesson();}};
document.querySelector('#guidePrev').onclick=()=>{if(guideIndex>0){lessonDrag.cancel();guideIndex--;resetLesson();}};
document.querySelector('#guideExit').onclick=()=>{lessonDrag.cancel();document.querySelector('#rules').close();guideStartup=false;centerMobileBoard();};
document.querySelector('#rules').addEventListener('cancel',()=>{lessonDrag.cancel();guideStartup=false;});
document.querySelector('#lessonBoard').oncontextmenu=e=>{if(lessonSelected){e.preventDefault();document.querySelector('#lessonRotate').click();}};
document.addEventListener('keydown',e=>{if(!document.querySelector('#rules').open||!lessonSelected||e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Space'){e.preventDefault();if(!e.repeat)document.querySelector('#lessonRotate').click();}else if(e.key.toLowerCase()==='f'){e.preventDefault();document.querySelector('#lessonFlip').click();}});
